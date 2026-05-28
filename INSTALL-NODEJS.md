# Node.js auf Mac installieren

## Schnellste Methode: Homebrew

### 1. Homebrew installieren (falls noch nicht vorhanden)

Terminal öffnen und ausführen:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Node.js installieren

```bash
brew install node
```

### 3. Überprüfen

```bash
node --version
npm --version
```

### 4. Dann zurück zum Projekt

```bash
cd "/Users/janasimionovici/Desktop/ANGEWANDTE/S26/workshop"
npm install
npm start
```

## Alternative: Installer von nodejs.org

1. Gehe zu https://nodejs.org
2. Download "LTS" Version (empfohlen)
3. .pkg Datei öffnen und installieren
4. Terminal neu öffnen
5. Dann: `npm install` und `npm start`

## Thermodrucker am Mac

Sobald Node.js installiert ist und Sie den Drucker anschließen:

```bash
# Server starten
npm start

# In anderem Terminal-Fenster testen:
node test-printer.js
```

**Wichtig:** Auf macOS können USB-Berechtigungen manchmal kompliziert sein.
Falls der Drucker nicht erkannt wird, siehe Troubleshooting in README-PRINTER.md

## Vorerst ohne Drucker testen

Der Server funktioniert auch ohne Drucker:
- Frontend funktioniert komplett
- Print-Button sendet Daten
- Ausgabe erscheint in der Console (Simulation)

So können Sie alles testen bevor der Drucker da ist!
