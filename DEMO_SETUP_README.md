# Demo-Projekt Setup

## Überblick

Das **Demo-Setup-Script** (`js/demo-setup.js`) erstellt automatisch ein Demo-Projekt basierend auf der **Koumasa 2023 Trench 16 Ausgrabung** mit 13 dokumentierten Funden aus drei Ausgrabungseinheiten (Units 115, 116, 117) mit Bildern aus `partials/images/bilder`.

## Merkmale

✅ **13 Dokumentierte Funde** aus echter Ausgrabung (Koumasa 2023):
- **Unit 115 (Room 1)**: 5 Keramikgefäße, Keramikscherben, Tierknochen, Holzkohle, Gipsabdrücke
- **Unit 116 (Room 2)**: Keramikscherben, Tierknochen, Gipsabdrücke, Ashlar-Steinblock (architektonisches Element)
- **Unit 117 (Room 1)**: Keramikscherben mit Farbspuren, Holzkohle, bemalter Gipsabdruck

✅ **Reale stratigraphische Daten**:
- Tiefenmessungen mit Stationstexten
- Stratigraphische Beziehungen zwischen Einheiten
- Kontext dokumentiert (Raum- und Lagerungsdetails)
- Probenkatalogisierung (2023-16-XXX-Klassifizierung)

✅ **Authentische Bilddokumentation** aus `partials/images/bilder/`:
- image.png - image copy 12.png
- (insgesamt 13 hochwertige Archäologie-Fotos)

✅ **Automatische Verwaltung**:
- Prüft ob Demo-Projekt bereits existiert
- Verhindert Duplikate
- Optional: Löschfunktion für Demo-Teil

## Verwendung

### 1. Demo über Web-Interface erstellen

1. Navigiere zu: `pages/admin/demo-setup.html`
2. Klicke auf "✨ Demo-Daten erstellen"
3. Das Script erstellt automatisch:
   - 1 Ausgrabungsprojekt "Koumasa 2023 - Trench 16 Excavation"
   - 13 dokumentierte Funde aus drei realen Ausgrabungseinheiten
   - Vollständige stratigraphische und kontextuelle Dokumentation
4. Überprüfe das Ergebnis unter "Öffentliche Projekte"

### 2. Demo programmgesteuert erstellen

```Klicke auf "✨ Demo-Daten erstellen"
2. Das Script erstellt automatisch:
   - 1 Ausgrabungsprojekt "Koumasa 2023 - Trench 16 Excavation"
   - 13 dokumentierte Funde aus drei Ausgrabungseinheiten
   - Vollständige stratigraphische und kontextuelle Informationen
3``

### 3. Demo löschen

```javascript
import { deleteDemoProject } from './js/demo-setup.js';

const result = await deleteDemoProject();
console.log(result); // { success: true }
```

## Dateistruktur

```
js/demo-setup.js          ← Hauptscript
pages/admin/demo-setup.html ← Web-Interface
partials/images/bilder/   ← Bilder der Demo-Funde
  ├── image.png
  ├── image copy.png
  ├── image copy 2.png
  └── ... (insgesamt 13 Bilder)
```

## Technische Details

### Konstanten

```javascript
DEMO_PROJECT_NAME  = 'Koumasa 2023 - Trench 16 Excavation'
DEMO_IMAGES       = Array von 13 Bildpfaden
DEMO_FINDS        = Array von 13 dokumentierten Fund-Objekten aus realer Ausgrabung
DEMO_DATASET_KEY  = 'koumasa-2023-trench-16'
```

### Datenstruktur (Fund)

Jeder Fund enthält dokumentierte archäologische Felddata:

```javascript
{
    name,              // Fundbezeichnung mit Katalognummer (z.B. 2023-16-115-C06)
    description,       // Feldnotizbuch-Beschreibung mit stratigraphischem Kontext
    category,          // Objektklasse (Keramik, Architektur, Zoologie, etc.)
    material,          // Materialbestimmung
    dating,            // Chronologische Einordnung
    dateFound,         // Grabungsdatum
    location_found,    // Raum und Grabungseinheit (z.B. "Room 1, Unit 115")
    depth,             // Tiefenmessungen mit Stationsnummern (z.B. "B567 d. 418.854m")
    grid_square,       // Grabungsraster (Trench 16)
    excavation_unit,   // Stratigraphische Einheit (115, 116, 117)
    condition,         // Erhaltungszustand
    samples_collected, // Assozierte Proben und Nummern
    significance,      // Wissenschaftliche Bedeutung
    stratigraphy,      // Stratigraphische Beziehungen zu anderen Einheiten
    notes,             // Feldnotizen und Beobachtungen
    tags,              // Indexing-Tags
    latitude,          // Breitengrad
    longitude,         // Längengrad
    images             // Bildpfade (Feldfotos)
}
    images             // Bildpfade aus partials/images/bilder/
}
```

## Sicherheit & Best Practices

🔒 **Das Script:**
- Prüft Benutzerauthentifizierung vor Erstellung
- Verhindert automatisch Duplikate
- Speichert alle Daten in Firebase Firestore
- Markiert Funde als öffentliche Beispiele
- Verlinkt alle Bilder zu lokalen Bildpfaden

## Troubleshooting

### Problem: "Benutzer nicht angemeldet"
**Lösung**: Melden Sie sich zuerst an, bevor Sie die Demo erstellen.

### Problem: Demo existiert bereits
**Lösung**: Das ist normal - das Script verhindert Duplikate. Zum Löschen:
```javascript
import { deleteDemoProject } from './js/demo-setup.js';
await deleteDemoProject();
```

### Problem: Bilder werden nicht angezeigt
**Lösung**: Überprüfen Sie, dass `partials/images/bilder/` alle erwarteten Bilder enthält.

## Integration mit anderen Pages

Die Demo wird automatisch:
- unter "Öffentliche Projekte" angezeigt
- mit Details auf der Projekt-Detail-Seite sichtbar
- mit Bildern in der Funde-Übersicht gezeigt
- mit geolatitudem auf der Karte eingetragen

## Weitere Informationen

Für Updates oder Änderungen an der Demo-Struktur, editieren Sie:
- `DEMO_PROJECT` - Projekteinstellungen
- `DEMO_FINDS` - Fund-Katalog
- `DEMO_IMAGES` - Bildpfade

---

📅 **Erstellt**: 2026-03-01
⚙️ **Version**: 1.0
