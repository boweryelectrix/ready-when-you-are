# Bilder für "Submit Early"

## Ordnerstruktur

Dieser Ordner enthält alle Bilder für die Installation.

### Generierte Visuals (4 Stück)

Die "AI-generierten" Visuals, die zufällig ausgewählt werden:

```
images/
  ├── generated-1.jpg    → Modeklasse Fashion Show Poster
  ├── generated-2.jpg    → Immersive Truth VR Poster
  ├── generated-3.jpg    → Heul Doch Poster
  └── generated-4.jpg    → Detail/Glitch Version
```

### Original Source Works (4 Stück)

Die "abgelehnten Studenten-Submissions" die als Source angezeigt werden:

```
images/
  ├── source-1.jpg       → Original zu generated-1
  ├── source-2.jpg       → Original zu generated-2
  ├── source-3.jpg       → Original zu generated-3
  └── source-4.jpg       → Original zu generated-4
```

## Zuordnung

| Generated Visual | Student Author | Source Image |
|-----------------|----------------|--------------|
| generated-1.jpg | L. WEBER       | source-1.jpg |
| generated-2.jpg | M. KOWALSKI    | source-2.jpg |
| generated-3.jpg | S. NAKAMURA    | source-3.jpg |
| generated-4.jpg | A. PETROV      | source-4.jpg |

## Bild-Anforderungen

- **Format:** JPG oder PNG
- **Empfohlene Größe:** Mind. 1000x1000px (Quadratisch bevorzugt)
- **Qualität:** Hochauflösend für Druck (wenn Thermodrucker verwendet wird)

## So fügen Sie Bilder hinzu:

1. Speichern Sie die 4 generierten Visuals als:
   - `generated-1.jpg`
   - `generated-2.jpg`
   - `generated-3.jpg`
   - `generated-4.jpg`

2. Speichern Sie die 4 Original-Werke als:
   - `source-1.jpg`
   - `source-2.jpg`
   - `source-3.jpg`
   - `source-4.jpg`

3. Legen Sie alle in diesen Ordner: `images/`

4. Neu laden im Browser → Die Bilder werden automatisch angezeigt!

## Was passiert im System:

1. User gibt Prompt ein
2. **Zufällig** wird eines der 4 `generated-X.jpg` Bilder ausgewählt
3. Beim Drucken wird das passende `source-X.jpg` als "Original" angezeigt
4. Der Match-Prozent zeigt 94-98% an
5. Botschaft: "1:1 COPY OF SOURCE WORK"

## Fallback

Wenn Bilder nicht gefunden werden:
- Grauer Platzhalter mit Text `[ image not found ]`
- System funktioniert trotzdem weiter
