// Still working on this

import { AwesomeQR, QRErrorCorrectLevel } from "../src/index";
import Jimp from "jimp";
import crypto from "crypto";
import assert from "assert";
import jsQR from "jsqr";

describe("Common tests", () => {
  it("Should draw and decode QR code without errors", (done) => {
    (async () => {
      try {
        const expected = "Awesome-qr.js🧡";
        const qr = new AwesomeQR({ text: expected, size: 400, margin: 10 });
        const buf = (await qr.draw()) as Buffer;
        const image = await Jimp.read(buf);
        const decoded = jsQR(Uint8ClampedArray.from(image.bitmap.data), image.bitmap.width, image.bitmap.height, {
          inversionAttempts: "attemptBoth",
        });
        assert.strictEqual(expected, decoded?.data);
        done();
      } catch (err) {
        if (err instanceof Error) {
          done(err);
        } else {
          done(new Error(err));
        }
      }
    })();
  });

  it("Should fail drawing QR code due to excessive data", (done) => {
    (async () => {
      try {
        const qr = new AwesomeQR({ text: crypto.randomBytes(4000).toString(), correctLevel: QRErrorCorrectLevel.L });
        await qr.draw();
        done(new Error("Expecting an error to be thrown"));
      } catch (err) {
        done();
      }
    })();
  });
});
