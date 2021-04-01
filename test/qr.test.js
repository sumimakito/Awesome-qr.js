const assert = require("assert");
const { AwesomeQR, QRErrorCorrectLevel } = require("../lib/index");
const QrReader = require("qrcode-reader");
const Jimp = require("jimp");
const crypto = require("crypto");

describe("Common tests", () => {
  it("Should draw and decode QR code without errors", (done) => {
    (async () => {
      try {
        const expected = "Awesome-qr.js🧡";
        const qr = new AwesomeQR({ text: expected });
        const buf = await qr.draw();
        const image = await Jimp.read(buf);
        const reader = new QrReader();
        const decoded = await new Promise((resolve, reject) => {
          reader.callback = (err, v) => (err != null ? reject(err) : resolve(v));
          reader.decode(image.bitmap);
        });
        assert.strictEqual(expected, decoded.result);
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
