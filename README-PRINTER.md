# Thermodrucker Setup für "Submit Early"

## Übersicht

Die Installation druckt automatisch einen Beleg wenn der **"Print my visual"** Button gedrückt wird.

Der Beleg enthält:
- Zeitstempel
- User-Prompt
- Das generierte Bild
- Analyse-Ergebnis (Match-Prozent)
- Source-Informationen
- Die Botschaft: "YOUR VISUAL WAS NOT YOURS"

## Hardware-Anforderungen

### Empfohlene Thermodrucker

**USB-Thermodrucker (58mm oder 80mm):**
- Epson TM-T20II / TM-T88 Serie
- Epson TM-m30 (Bluetooth + USB)
- Star Micronics TSP143/TSP654
- Generic ESC/POS kompatible Thermodrucker
- Adafruit Mini Thermal Receipt Printer

**Wo kaufen:**
- Amazon, eBay: "USB Thermal Receipt Printer 58mm"
- Sparkfun, Adafruit für Bastler-Drucker
- Gebraucht: eBay (Kassendrucker)

**Benötigt:**
- USB-Kabel (meist im Lieferumfang)
- Thermo-Papierrollen (58mm oder 80mm, je nach Drucker)
- Computer mit USB-Port (Mac/Windows/Linux)

## Installation

### 1. Dependencies installieren

```bash
# Im Projekt-Verzeichnis:
npm install
```

### 2. Drucker anschließen & testen

```bash
# Drucker per USB verbinden

# Test ob Drucker erkannt wird:
npm run test-printer

# Sollte eine Testseite drucken
```

### 3. Server starten

```bash
npm start
```

### 4. Browser öffnen

```
http://localhost:3000
```

## Drucker-Status prüfen

```bash
# API-Endpoint:
curl http://localhost:3000/api/printer/status

# Ausgabe:
{
  "printerAvailable": true,
  "devicesFound": 1,
  "devices": [
    {"vendor": 1208, "product": 514}
  ]
}
```

## Troubleshooting

### Drucker nicht gefunden

**Grundlegende Checks:**
1. Ist der Drucker eingeschaltet?
2. Ist das USB-Kabel korrekt angeschlossen?
3. Funktioniert der USB-Port? (anderes Gerät testen)

**macOS:**
```bash
# Prüfe ob Drucker erkannt wird:
system_profiler SPUSBDataType | grep -A 10 "Printer"

# Drucker-Treiber installieren (falls nötig):
# https://epson.com/Support/Printers/
```

**Windows:**
- Geräte-Manager öffnen (Win+X → Geräte-Manager)
- Unter "USB-Geräte" oder "Drucker" nach dem Gerät suchen
- Treiber von Hersteller-Website installieren

**Linux:**
```bash
# Prüfe USB-Geräte:
lsusb

# USB-Berechtigungen setzen:
sudo usermod -a -G lp,dialout $USER
# Dann neu anmelden!

# udev-Regeln neu laden:
sudo udevadm control --reload-rules
sudo udevadm trigger
```

### Module nicht kompiliert (Linux)

```bash
# System-Bibliotheken installieren:
sudo apt-get install -y libusb-1.0-0-dev libudev-dev build-essential

# Node modules neu bauen:
npm rebuild
```

### Drucker druckt nicht oder abgeschnitten

1. **Papier prüfen:** Thermorolle eingelegt? Deckel geschlossen?
2. **Papierrichtung:** Glänzende Seite = Druckseite (Thermopapier!)
3. **Papierbreite:** 58mm oder 80mm? (muss zum Drucker passen)
4. **Testseite:** `npm run test-printer` ausführen

## Simulation (ohne Drucker)

Der Server funktioniert auch **ohne angeschlossenen Drucker**:

```bash
npm start
```

Dann wird:
- ✓ Webinterface funktioniert normal
- ✓ Print-Button sendet Daten
- ⚠️ Ausgabe erfolgt nur in der Console (Simulation)

Nützlich für:
- Entwicklung auf dem Mac
- Testen ohne Hardware
- Mehrere Installationen (nur eine hat Drucker)

## Papier-Empfehlungen

**58mm Thermodrucke:**
- Rolls: 58mm x 30m oder 50m
- Papiertyp: BPA-frei empfohlen
- Qualität: 55-65 g/m²

**80mm Thermodrucke:**
- Rolls: 80mm x 80mm
- Bessere Qualität für Bilder

**Bezugsquellen:**
- Amazon: "Thermopapier Rollen 58mm"
- Office-Bedarf: Kassenrollen
- Spezialisiert: Bonrollen24.de

## Erweiterte Konfiguration

### Druckbreite anpassen

In `server.js`, Zeile ~160:

```javascript
const maxWidth = 384;  // 58mm Drucker
// const maxWidth = 576;  // 80mm Drucker
```

### Bild-Qualität

```javascript
// Höhere Auflösung = bessere Qualität, langsamer
printer.image(escposImage, 'd24');  // Standard
// printer.image(escposImage, 'd8');   // Schneller, schlechter
```

### Text-Layout anpassen

In `server.js`, Funktion `printReceipt()`:
- `.size(1, 1)` = Doppelte Größe
- `.style('b')` = Bold
- `.align('ct')` = Center
- `.drawLine()` = Trennlinie

## Production Deployment (Linux)

Für permanente Installation mit Auto-Start auf Linux-Servern:

```bash
# PM2 Process Manager installieren (empfohlen)
npm install -g pm2

# Server als Hintergrunddienst starten
pm2 start server.js --name submit-early

# Auto-Start bei System-Boot
pm2 startup
pm2 save

# Logs anzeigen
pm2 logs submit-early

# Neu starten
pm2 restart submit-early

# Stoppen
pm2 stop submit-early
```

## Netzwerk-Zugriff

Andere Geräte im lokalen Netzwerk können auch drucken:

```
http://<COMPUTER_IP_ADDRESS>:3000
```

Nützlich für:
- Tablets als Interface
- Mehrere Teilnehmer
- Remote-Administration

**IP-Adresse finden:**
- macOS: `ifconfig | grep "inet "` oder Systemeinstellungen → Netzwerk
- Windows: `ipconfig` in CMD
- Linux: `ip addr` oder `ifconfig`

## Support

**Bei Problemen:**
1. `npm run test-printer` → Drucker erkannt?
2. `curl localhost:3000/api/printer/status` → API funktioniert?
3. Browser-Console öffnen → JavaScript-Fehler?

**Häufigste Probleme:**
- USB-Berechtigungen (Linux) → Neu anmelden nach usermod!
- Module nicht kompiliert (Linux) → `npm rebuild`
- Drucker-Treiber fehlen (macOS/Windows) → Von Hersteller-Website installieren
- Falscher Drucker-Typ → ESC/POS kompatibel?
