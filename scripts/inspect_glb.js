const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, '../client/public/assets/campus/block-d.glb');

if (fs.existsSync(glbPath)) {
  const stats = fs.statSync(glbPath);
  console.log(`GLB File Exists! Path: ${glbPath}`);
  console.log(`File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

  // Read GLB Header (Magic bytes: 0x46544C67 = "glTF")
  const buffer = fs.readFileSync(glbPath);
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  console.log(`Magic: 0x${magic.toString(16)} (${magic === 0x46544C67 ? 'VALID GLTF' : 'INVALID'})`);
  console.log(`Version: ${version}`);
  console.log(`Header Length: ${length} bytes`);
} else {
  console.log(`GLB File NOT found at ${glbPath}`);
}
