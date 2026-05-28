/* ══════════════════════════════════════════════════════════════
   SERVER – "Submit Early" mit Thermodrucker-Unterstützung
   ══════════════════════════════════════════════════════════════ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');
const getPixels = require('get-pixels');

// Thermodrucker-Module
let escpos;
let USB;
let device;
let printer;

// Epson TM-T88V USB IDs
const PRINTER_VID = 0x04b8;
const PRINTER_PID = 0x0202;

// Versuche Drucker-Module zu laden
let printerAvailable = false;
try {
  escpos = require('escpos');
  USB = require('escpos-usb');
  escpos.USB = USB;

  // Patch: usb.on('detach') ist in usb v2.x + Node v26 nicht verfügbar
  // Wir patchen das usb-Modul damit escpos-usb nicht crasht
  const usbModule = require('usb');
  if (typeof usbModule.on !== 'function') {
    usbModule.on = function() {}; // no-op stub
  }

  printerAvailable = true;
  console.log('✓ Thermodrucker-Module geladen');
} catch (err) {
  console.log('⚠ Thermodrucker-Module nicht verfügbar (nur Simulation)');
  console.log('  Zum Installieren: npm install escpos escpos-usb usb');
}

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ══════════════════════════════════════════════════════════════
// PRINT ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/print', upload.single('image'), async (req, res) => {
  console.log('\n📄 Print-Anfrage erhalten...');

  const { prompt, sourceAuthor, sourceId, matchPercent, userGenerated } = req.body;
  const imageBuffer = req.file ? req.file.buffer : null;

  if (!imageBuffer) {
    return res.status(400).json({ success: false, error: 'No image file received' });
  }

  try {
    // Drucker initialisieren
    if (printerAvailable) {
      await initPrinter();
    }

    // Drucke den Beleg
    await printReceipt({
      imageBuffer,
      prompt,
      sourceAuthor,
      sourceId,
      matchPercent,
      userGenerated
    });

    res.json({ 
      success: true, 
      message: 'Druck erfolgreich',
      printerAvailable 
    });

  } catch (error) {
    console.error('❌ Druckfehler:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      printerAvailable 
    });
  }
});

// ══════════════════════════════════════════════════════════════
// DRUCKER INITIALISIERUNG
// ══════════════════════════════════════════════════════════════
async function initPrinter() {
  if (!printerAvailable) {
    console.log('⚙ Simulation: Drucker initialisiert');
    return;
  }

  try {
    // Drucker direkt über VID/PID ansprechen
    // (findPrinter() findet den TM-T88V nicht, da er USB-Klasse 255 statt 7 meldet)
    device = new USB(PRINTER_VID, PRINTER_PID);
    
    if (!device) {
      throw new Error('Kein USB-Drucker gefunden');
    }

    printer = new escpos.Printer(device);
    console.log('✓ Thermodrucker verbunden (Epson TM-T88V)');
    
  } catch (err) {
    throw new Error(`Drucker-Initialisierung fehlgeschlagen: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
// DRUCKE BELEG
// ══════════════════════════════════════════════════════════════
async function printReceipt(data) {
  const timestamp = new Date().toLocaleString('de-DE');
  
  if (!printerAvailable) {
    // Simulation - zeige in Console was gedruckt würde
    console.log('═══════════════════════════════════════');
    console.log('    SUBMIT EARLY - OUTPUT RECEIPT');
    console.log('═══════════════════════════════════════');
    console.log(`\nDATE: ${timestamp}`);
    console.log(`PROMPT: "${data.prompt}"`);
    console.log(`\n[BILD würde hier gedruckt - ${data.imageBuffer ? data.imageBuffer.length + ' bytes' : 'kein Bild'}]`);
    console.log('\n───────────────────────────────────────');
    console.log('        ANALYSIS RESULT');
    console.log('───────────────────────────────────────');
    console.log(`MATCH: ${data.matchPercent}%`);
    console.log(`SOURCE: ${data.sourceAuthor}`);
    console.log(`ID: ${data.sourceId}`);
    console.log('\n═══════════════════════════════════════');
    console.log('   YOUR VISUAL WAS NOT YOURS.');
    console.log('═══════════════════════════════════════\n');
    return;
  }

  // Echter Druck
  return new Promise((resolve, reject) => {
    device.open(async (err) => {
      if (err) {
        reject(new Error('Drucker konnte nicht geöffnet werden: ' + err.message));
        return;
      }

      try {
        // Header
        printer
          .font('a')
          .align('ct')
          .style('b')
          .size(1, 1)
          .text('SUBMIT EARLY')
          .text('OUTPUT RECEIPT')
          .drawLine()
          .style('normal')
          .size(0, 0)
          .text('')
          .align('lt')
          .text(`DATE: ${timestamp}`)
          .text(`USER: ${data.userGenerated || 'ANONYMOUS'}`)
          .text('')
          .text('PROMPT:')
          .text(wrapText(data.prompt, 32))
          .text('');

        // Bild drucken (wenn vorhanden)
        if (data.imageData) {
          try {
            // Base64 -> Buffer -> Canvas resizen -> temp PNG speichern
            const img = await loadImage(data.imageData);
            
            const maxWidth = 384;
            const ratio = maxWidth / img.width;
            const printWidth = maxWidth;
            const printHeight = Math.floor(img.height * ratio);

            const canvas = createCanvas(printWidth, printHeight);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, printWidth, printHeight);

            const pngBuffer = canvas.toBuffer('image/png');
            const pixels = await new Promise((imgResolve, imgReject) => {
              getPixels(pngBuffer, 'image/png', (err, pixels) => {
                if (err) return imgReject(err);
                imgResolve(pixels);
              });
            });

            const escposImage = new escpos.Image(pixels);
            printer.align('ct').image(escposImage, 'd24');
            
          } catch (imgErr) {
            console.error('Bild-Druck Fehler:', imgErr);
            printer.text('[IMAGE ERROR]');
          }
        }

        // Analysis Result
        printer
          .text('')
          .drawLine()
          .align('ct')
          .style('b')
          .text('ANALYSIS RESULT')
          .drawLine()
          .style('normal')
          .align('lt')
          .text('')
          .text(`MATCH: ${data.matchPercent}%`)
          .text(`SOURCE: ${data.sourceAuthor}`)
          .text(`ID: ${data.sourceId}`)
          .text('STATUS: 1:1 COPY DETECTED')
          .text('')
          .drawLine()
          .align('ct')
          .style('b')
          .size(1, 1)
          .text('')
          .text('YOUR VISUAL')
          .text('WAS NOT YOURS.')
          .text('')
          .style('normal')
          .size(0, 0)
          .text('This work was generated from')
          .text('rejected submissions.')
          .text('')
          .drawLine()
          .text('')
          .text('angewandte.at/submit-early')
          .text('')
          .cut()
          .close(() => {
            console.log('✓ Druck abgeschlossen');
            resolve();
          });

      } catch (printErr) {
        reject(printErr);
      }
    });
  });
}

// Hilfsfunktion: Text umbrechen für Drucker
function wrapText(text, maxLength) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxLength) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
}

// ══════════════════════════════════════════════════════════════
// STATUS ENDPOINT (zum Testen)
// ══════════════════════════════════════════════════════════════
app.get('/api/printer/status', (req, res) => {
  let devices = [];
  
  if (printerAvailable) {
    try {
      // Direkt nach dem Epson TM-T88V suchen (USB-Klasse 255, nicht von findPrinter() gefunden)
      const usbModule = require('usb');
      const epson = usbModule.findByIds(PRINTER_VID, PRINTER_PID);
      if (epson) {
        devices = [epson];
      }
    } catch (err) {
      console.error('Fehler beim Suchen von Druckern:', err);
    }
  }

  res.json({
    printerAvailable,
    devicesFound: devices.length,
    devices: devices.map(d => ({
      vendor: d.deviceDescriptor.idVendor,
      product: d.deviceDescriptor.idProduct
    }))
  });
});

// ══════════════════════════════════════════════════════════════
// SERVER START
// ══════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        SUBMIT EARLY - Installation Server            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

🌐 Server läuft auf: http://localhost:${PORT}
${printerAvailable ? '🖨  Thermodrucker: VERFÜGBAR' : '⚠️  Thermodrucker: SIMULATION'}

Zum Testen:
  → Öffne http://localhost:${PORT}
  → Status: http://localhost:${PORT}/api/printer/status

Drucker-Module installieren:
  → npm install escpos escpos-usb usb
  → Linux: sudo apt-get install libusb-1.0-0-dev

Beenden mit: Ctrl+C
`);
});
