import { QRCodeGenerator } from '../index';
import 'mocha';

describe("QR code tests", () => {
    it("Main test", (done) => {
        const qrCodeGenerator = new QRCodeGenerator({
            text: 'http://www.beaconstac.com/',
            backgroundImage: "https://image.flaticon.com/teams/slug/google.jpg",
            logoImage: __dirname + "/pokemon.png"
        });
        qrCodeGenerator.create().then(canvas => {
            console.log(canvas.toDataURL());
        }).finally(done);

    });
});