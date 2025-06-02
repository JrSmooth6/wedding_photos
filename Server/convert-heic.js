const heicConvert = require('heic-convert');
const fs = require('fs');

module.exports = async function convertHeicToJpeg(inputPath, outputPath) {
  const inputBuffer = fs.readFileSync(inputPath);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 1
  });
  fs.writeFileSync(outputPath, outputBuffer);
};
