# Submit Early - Installation

![Bild](./Screenshot%202026-05-30%20at%2007.31.20.png)

Eine interaktive Installation über KI-generierte Kunst und deren ethische Implikationen.

## Features

- ✨ Generative AI Interface (Simulation)
- 🔍 Echtzeit-Analyse und Plagiatserkennung
- 🖨️ **USB Thermodrucker-Integration** für physische Receipts
- 📊 Visualisierung von Training-Data-Problematik

## Quick Start

### Installation

```bash
# 1. Dependencies installieren
npm install

# 2. Server starten
npm start

# 3. Browser öffnen
open http://localhost:3000
```

**Ohne Drucker:** Der Server funktioniert auch ohne angeschlossenen Drucker - die Print-Funktion wird simuliert und in der Console geloggt.

**Mit Drucker:** Schließe einen ESC/POS-kompatiblen USB-Thermodrucker an (z.B. Epson TM-T20, TM-m30). Der Server erkennt ihn automatisch beim Start.

## Technologie

- **Frontend:** Vanilla JavaScript, Canvas API
- **Backend:** Node.js, Express
- **Drucker:** ESC/POS Protocol (USB-Thermodrucker)

## Dateien

```
index.html          - Haupt-Interface
script.js           - Frontend-Logik
style.css           - Styling
server.js           - Backend-API + Drucker-Steuerung
package.json        - Dependencies
test-printer.js     - Drucker-Test-Tool
```

## Drucker-Setup

### Hardware-Empfehlungen
- Epson TM-T20II
- Epson TM-m30
- Oder andere ESC/POS-kompatible USB-Thermodrucker

### Drucker testen

```bash
# Prüfe ob Drucker erkannt wird
npm run test-printer
```

### Troubleshooting

**Drucker wird nicht erkannt:**
- USB-Kabel prüfen
- Drucker-Treiber installieren (macOS/Windows)
- Auf Linux: USB-Permissions setzen (`sudo chmod 666 /dev/usb/lp0`)

## API Endpoints

```bash
# Status prüfen
GET /api/printer/status

# Drucken (wird automatisch vom Frontend aufgerufen)
POST /api/print
{
  "imageData": "base64...",
  "prompt": "user prompt",
  "sourceAuthor": "L. WEBER",
  "sourceId": "A-2024-0418",
  "matchPercent": "97%"
}
```

## Troubleshooting

**Server startet nicht:**
```bash
npm install  # Dependencies neu installieren
```

**Drucker nicht gefunden:**
```bash
node test-printer.js  # Drucker-Test
lsusb                 # USB-Geräte auflisten
```

**Berechtigungsfehler:**
```bash
sudo usermod -a -G lp,dialout $USER
# Dann neu anmelden!
```

## Konzept

Die Installation konfrontiert Nutzer mit der Realität von AI-Kunst:
1. User gibt Prompt ein
2. System "generiert" Bild (Simulation)
3. Beim Drucken: Echtzeit-Analyse zeigt 94-98% Match
4. Quelle: Abgelehnte Student-Submissions
5. Message: **"YOUR VISUAL WAS NOT YOURS"**

Der Thermodruck dient als physisches Artefakt und Beweis.