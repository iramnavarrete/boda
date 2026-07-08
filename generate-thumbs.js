/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootGallery = 'public/img/andrea-adrian/gallery';

const inputDir = path.join(__dirname, rootGallery);       // carpeta con imágenes originales
const outputDir = path.join(__dirname, rootGallery + '/thumbs'); // destino de los thumbnails

const MAX_DIMENSION = 1500; // Límite máximo para el lado más largo

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
      // fit: 'inside' respeta la proporción original. 
      // El lado más largo (ancho o alto) será máximo de 1200px.
      .resize({ 
        width: MAX_DIMENSION, 
        height: MAX_DIMENSION, 
        fit: 'inside',
        withoutEnlargement: true // Evita que fotos más pequeñas que 1200px se estiren y pixelen
      })
      // Optimizaciones extremas según el formato de la imagen original
      .jpeg({ 
        quality: 80, 
        progressive: true, 
        mozjpeg: true // Usa el motor de Mozilla (más lento de procesar, pero pesa mucho menos y se ve mejor)
      })
      .png({ 
        quality: 80, 
        compressionLevel: 9 
      })
      .webp({ 
        quality: 90, 
        effort: 6 // Nivel de compresión de CPU máximo para WebP (0-6)
      })
      .toFile(outputPath)
      .then(info => {
        // Mostramos el peso final en KB para que veas la mejora
        const sizeKb = (info.size / 1024).toFixed(2);
        console.log(`✅ Thumbnail generado: ${file} (${sizeKb} KB)`);
      })
      .catch(err => console.error(`❌ Error procesando ${file}`, err));
  }
});