/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Capturamos el primer argumento pasado por línea de comandos
const folderName = process.argv[2];

// Validamos que se haya enviado el parámetro
if (!folderName) {
  console.error('❌ Error: Debes proporcionar el nombre de la carpeta como parámetro.');
  console.error('💡 Ejemplo de uso: node generate-thumbs.js andrea-adrian');
  process.exit(1); // Detenemos la ejecución
}

// Sustituimos el valor hardcodeado por la variable
const rootGallery = `public/img/${folderName}/gallery`;

const inputDir = path.join(__dirname, rootGallery);       // carpeta con imágenes originales
const outputDir = path.join(__dirname, rootGallery + '/thumbs'); // destino de los thumbnails

const MAX_DIMENSION = 1500; // Límite máximo para el lado más largo

// Validamos que el directorio de entrada exista antes de continuar
if (!fs.existsSync(inputDir)) {
  console.error(`❌ Error: La carpeta origen no existe -> ${inputDir}`);
  process.exit(1);
}

// Asegúrate de que el directorio de salida exista
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`⏳ Procesando imágenes en: ${rootGallery}...`);

// Procesa cada imagen
fs.readdirSync(inputDir).forEach(file => {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  if (/\.(jpe?g|png|webp)$/i.test(file)) {
    sharp(inputPath)
      // fit: 'inside' respeta la proporción original. 
      // El lado más largo (ancho o alto) será máximo de 1500px.
      .resize({ 
        width: MAX_DIMENSION, 
        height: MAX_DIMENSION, 
        fit: 'inside',
        withoutEnlargement: true // Evita que fotos más pequeñas se estiren y pixelen
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