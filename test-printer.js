#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════
   THERMODRUCKER TEST SCRIPT
   Testet ob der Drucker erkannt wird und druckt eine Testseite
   ══════════════════════════════════════════════════════════════ */

let escpos, USB;

try {
  escpos = require('escpos');
  USB = require('escpos-usb');
  escpos.USB = USB;
} catch (err) {
  console.error('❌ Module nicht installiert!');
  console.error('   Installieren mit: npm install escpos escpos-usb usb');
  process.exit(1);
}

console.log('🔍 Suche nach USB-Druckern...\n');

// Finde alle USB-Geräte
const devices = USB.findPrinter();

if (devices.length === 0) {
  console.log('❌ Keine USB-Drucker gefunden!\n');
  console.log('Troubleshooting:');
  console.log('  1. Drucker angeschlossen und eingeschaltet?');
  console.log('  2. USB-Berechtigungen gesetzt?');
  console.log('     → sudo usermod -a -G lp,dialout $USER');
  console.log('  3. udev-Regeln installiert?');
  console.log('     → siehe install-on-pi.sh');
  console.log('  4. System neu gestartet nach Berechtigungsänderung?');
  console.log('');
  process.exit(1);
}

console.log(`✓ ${devices.length} Drucker gefunden:\n`);

devices.forEach((device, i) => {
  const desc = device.deviceDescriptor;
  console.log(`Drucker ${i + 1}:`);
  console.log(`  Vendor ID:  0x${desc.idVendor.toString(16)}`);
  console.log(`  Product ID: 0x${desc.idProduct.toString(16)}`);
  console.log('');
});

// Verwende den ersten Drucker
console.log('📄 Drucke Testseite...\n');

const device = new USB();
const printer = new escpos.Printer(device);

device.open((err) => {
  if (err) {
    console.error('❌ Fehler beim Öffnen:', err.message);
    process.exit(1);
  }

  const timestamp = new Date().toLocaleString('de-DE');

  printer
    .font('a')
    .align('ct')
    .style('b')
    .size(1, 1)
    .text('SUBMIT EARLY')
    .text('SYSTEM TEST')
    .style('normal')
    .size(0, 0)
    .text('')
    .drawLine()
    .text('')
    .align('lt')
    .text(`Date: ${timestamp}`)
    .text('Status: OK')
    .text('')
    .text('Printer successfully connected!')
    .text('Ready for production use.')
    .text('')
    .drawLine()
    .text('')
    .align('ct')
    .text('')
    .cut()
    .close(() => {
      console.log('✓ Testseite gedruckt!');
      console.log('✓ Drucker ist einsatzbereit.');
      process.exit(0);
    });
});
