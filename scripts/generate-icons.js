// Create this as a script.js file and run with Node.js
// Or use an online tool like https://realfavicongenerator.net/

const fs = require('fs');
const { createCanvas } = require('canvas');

// Create directories if they don't exist
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

// Function to create a simple icon
function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#3b82f6'; // Blue background
  ctx.fillRect(0, 0, size, size);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size/2.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CT', size/2, size/2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./public/${filename}`, buffer);
  console.log(`Created ${filename}`);
}

// Create the icons
createIcon(192, 'android-chrome-192x192.png');
createIcon(512, 'android-chrome-512x512.png');
createIcon(180, 'apple-touch-icon.png');
createIcon(32, 'favicon-32x32.png');
createIcon(16, 'favicon-16x16.png');

console.log('Icons created successfully!');