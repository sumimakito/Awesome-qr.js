// Still working on this

import { AwesomeQR, QRErrorCorrectLevel } from "../src/index";
import Jimp from "jimp";
import crypto from "crypto";
import assert from "assert";
import jsQR from "jsqr";

describe("Common tests", () => {
  it("Should draw and decode QR code without errors", async () => {
    const expected = "Awesome-qr.js🧡";
    const qr = new AwesomeQR({ text: expected, size: 400, margin: 10 });
    const buf = (await qr.draw()) as Buffer;
    const image = await Jimp.read(buf);
    const decoded = jsQR(Uint8ClampedArray.from(image.bitmap.data), image.bitmap.width, image.bitmap.height, {
      inversionAttempts: "attemptBoth",
    });
    
    assert.strictEqual(expected, decoded?.data);
    // 不需要寫 try-catch 和 done() 了！
  });
  
  it("Should fail drawing QR code due to excessive data", async () => {
    let errorThrown = false;

    try {
      const qr = new AwesomeQR({ 
        text: crypto.randomBytes(4000).toString(), 
        correctLevel: QRErrorCorrectLevel.L 
      });
      await qr.draw();
    } catch (err) {
      // ✅ 成功捕捉到 "Too long data" 錯誤
      errorThrown = true;
      
      // 選填：如果您想進一步驗證錯誤訊息是否正確
      if (err instanceof Error) {
        assert.strictEqual(err.message, "Too long data");
      }
    }

    // ✅ 斷言測試：如果 errorThrown 為 false，代表沒有拋出錯誤，測試就會失敗
    assert.ok(errorThrown, "Expecting an error to be thrown");
  });
});
