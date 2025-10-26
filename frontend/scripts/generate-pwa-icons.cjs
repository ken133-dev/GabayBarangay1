const fs = require('fs');
const path = require('path');

// Simple SVG-based icon generator
function generateSVGIcon(size) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#136207"/>

  <!-- TC Text -->
  <text
    x="50%"
    y="45%"
    font-family="Arial, sans-serif"
    font-size="${size * 0.4}"
    font-weight="bold"
    fill="#ffffff"
    text-anchor="middle"
    dominant-baseline="middle">TC</text>

  <!-- Subtitle -->
  <text
    x="50%"
    y="75%"
    font-family="Arial, sans-serif"
    font-size="${size * 0.08}"
    fill="#ffffff"
    text-anchor="middle"
    dominant-baseline="middle">TheyCare</text>

  <!-- Health cross icon -->
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <rect x="${-size * 0.02}" y="${-size * 0.08}" width="${size * 0.04}" height="${size * 0.16}" fill="#d8b238" opacity="0.3"/>
    <rect x="${-size * 0.08}" y="${-size * 0.02}" width="${size * 0.16}" height="${size * 0.04}" fill="#d8b238" opacity="0.3"/>
  </g>
</svg>`;

  return svg;
}

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate icons
console.log('🎨 Generating PWA icons...');

const sizes = [192, 512];
sizes.forEach(size => {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(publicDir, filename);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generated ${filename}`);
});

console.log('\n📝 Note: SVG icons created. For production, convert to PNG using:');
console.log('   - Online tool: https://cloudconvert.com/svg-to-png');
console.log('   - Or use ImageMagick/Sharp for batch conversion');
console.log('\n✨ PWA icon generation complete!');
