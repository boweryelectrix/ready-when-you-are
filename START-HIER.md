# 🚀 SCHNELLSTART

## Lokal testen (JETZT auf Ihrem Mac)

```bash
# 1. Terminal öffnen und zu diesem Ordner navigieren:
cd "/Users/janasimionovici/Desktop/ANGEWANDTE/S26/workshop"

# 2. Dependencies installieren:
npm install

# 3. Server starten:
npm start

# 4. Browser öffnen:
http://localhost:3000
```

**Was passiert beim Drucken?**
- Ohne Drucker: Ausgabe in der Terminal-Console (Simulation)
- Mit Drucker: Echter physischer Druck

## Auf Raspberry Pi deployen

### Variante A: Automatisch

```bash
./deploy-to-pi.sh
# Folge den Anweisungen
```

### Variante B: Manuell

```bash
# 1. IP-Adresse des Pi herausfinden (am Pi):
hostname -I

# 2. Dateien kopieren:
scp -r . pi@<IP_ADRESSE>:~/submit-early

# 3. Auf Pi einloggen:
ssh pi@<IP_ADRESSE>

# 4. Installation ausführen:
cd ~/submit-early
./install-on-pi.sh
```

## Drucker testen (auf dem Pi)

```bash
ssh pi@<IP_ADRESSE>
cd ~/submit-early
node test-printer.js
```

Sollte eine Testseite drucken!

## Häufige Fragen

**Q: Brauche ich einen Thermodrucker?**
A: Nein! Es funktioniert auch ohne - dann wird in der Console ausgegeben.

**Q: Welchen Drucker soll ich kaufen?**
A: Jeder ESC/POS kompatible USB-Thermodrucker. Z.B.:
   - Epson TM-T20
   - Generic 58mm Thermodrucker von Amazon/eBay
   - Adafruit Mini Thermal Printer

**Q: Funktioniert es mit anderen Druckern?**
A: Nur Thermodrucker mit ESC/POS Protokoll. Keine Inkjet/Laser-Drucker!

**Q: Wie viel kostet ein Thermodrucker?**
A: Neu: 50-150€, Gebraucht (eBay): 20-50€

**Q: Server startet nicht?**
A: `npm install` ausführen, Node.js installiert?

## Nächste Schritte

1. ✅ Lokal testen (siehe oben)
2. 📖 Drucker-Details: **README-PRINTER.md** lesen
3. 🔧 Raspberry Pi Setup: **raspberry-pi-setup.md** lesen
4. 🖨️ Thermodrucker kaufen + anschließen
5. 🚀 Deployment auf Pi mit `./deploy-to-pi.sh`

## Support

Siehe **README-PRINTER.md** für ausführliches Troubleshooting!
