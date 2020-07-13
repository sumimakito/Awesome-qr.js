import GIF from 'js-binary-schema-parser/lib/schemas/gif'
import { parse } from 'js-binary-schema-parser'
import { buildStream } from 'js-binary-schema-parser/lib/parsers/uint8'
import { deinterlace } from './deinterlace'
import { lzw } from './lzw'

export const parseGIF = arrayBuffer => {
  const byteData = new Uint8Array(arrayBuffer)
  return parse(buildStream(byteData), GIF)
}

const generatePatch = image => {
  const totalPixels = image.pixels.length
  const patchData = new Uint8ClampedArray(totalPixels * 4)
  for (var i = 0; i < totalPixels; i++) {
    const pos = i * 4
    const colorIndex = image.pixels[i]
    const color = image.colorTable[colorIndex]
    patchData[pos] = color[0]
    patchData[pos + 1] = color[1]
    patchData[pos + 2] = color[2]
    patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0
  }

  return patchData
}

export const decompressFrame = (frame, gct, buildImagePatch) => {
  if (!frame.image) {
    console.warn('gif frame does not have associated image.')
    return
  }

  const { image } = frame

  // get the number of pixels
  const totalPixels = image.descriptor.width * image.descriptor.height
  // do lzw decompression
  var pixels = lzw(image.data.minCodeSize, image.data.blocks, totalPixels)

  // deal with interlacing if necessary
  if (image.descriptor.lct.interlaced) {
    pixels = deinterlace(pixels, image.descriptor.width)
  }

  const resultImage = {
    pixels: pixels,
    dims: {
      top: frame.image.descriptor.top,
      left: frame.image.descriptor.left,
      width: frame.image.descriptor.width,
      height: frame.image.descriptor.height
    }
  }

  // color table
  if (image.descriptor.lct && image.descriptor.lct.exists) {
    resultImage.colorTable = image.lct
  } else {
    resultImage.colorTable = gct
  }

  // add per frame relevant gce information
  if (frame.gce) {
    resultImage.delay = (frame.gce.delay || 10) * 10 // convert to ms
    resultImage.disposalType = frame.gce.extras.disposal
    // transparency
    if (frame.gce.extras.transparentColorGiven) {
      resultImage.transparentIndex = frame.gce.transparentColorIndex
    }
  }

  // create canvas usable imagedata if desired
  if (buildImagePatch) {
    resultImage.patch = generatePatch(resultImage)
  }

  return resultImage
}

export const decompressFrames = (parsedGif, buildImagePatches) => {
  return parsedGif.frames
    .filter(f => f.image)
    .map(f => decompressFrame(f, parsedGif.gct, buildImagePatches))
}
