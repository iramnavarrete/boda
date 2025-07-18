// generate-thumbs.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public/img/gallery');       // carpeta con imágenes originales
const outputDir = path.join(__dirname, 'public/img/gallery/thumbs'); // destino de los thumbnails

const THUMB_WIDTH = 1800; // Puedes ajustarlo a lo que necesites

// Asegúrate de que el directorio de salida exista
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Procesa cada imagen
fs.readdirSync(inputDir).forEach(file => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  if (/\.(jpe?g|png|webp)$/i.test(file)) {
    sharp(inputPath)
      .resize({ width: THUMB_WIDTH }) // se ajusta proporcionalmente
      .toFile(outputPath)
      .then(() => console.log(`✅ Thumbnail generado: ${file}`))
      .catch(err => console.error(`❌ Error procesando ${file}`, err));
  }
});
