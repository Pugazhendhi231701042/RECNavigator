const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '../client/public/assets/campus/block-d.glb');
const buffer = fs.readFileSync(glbPath);

console.log("First 200 bytes string content:");
console.log(buffer.toString('utf8', 0, 200));
