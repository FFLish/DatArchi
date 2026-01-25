# Quick Reference - Edit & Open Features

## Button Layout (Project Header)

```
┌─────────────────────────────────────────────────────────┐
│ [Bearbeiten] [Öffnen] [Teilen] [Löschen]              │
└─────────────────────────────────────────────────────────┘
     (Edit)    (Open)   (Share)  (Delete)
```

## "Bearbeiten" (Edit) Button - What Opens

```
┌─────────────────────────────────────────────────┐
│  Projekt bearbeiten                        ✕   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Projekttitel *                                │
│  [_______________________________]             │
│                                                 │
│  Beschreibung *                                │
│  [_________________________________]          │
│  [_________________________________]          │
│  [_________________________________]          │
│                                                 │
│  Fundort                                       │
│  [_______________________________]             │
│                                                 │
│  Zeitperiode                                   │
│  [_______________________________]             │
│                                                 │
│  [Änderungen speichern]                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Editable Fields:
- ✏️ Project title (name)
- ✏️ Description
- ✏️ Location (where excavation is)
- ✏️ Time period (e.g., Römisch, Keltisch)

---

## "Öffnen" (Open) Button - What Opens

```
┌─────────────────────────────────────────────────┐
│  Neuen Fund hinzufügen                     ✕   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Fundtitel *                                   │
│  [_______________________________]             │
│                                                 │
│  Material                                      │
│  [_______________________________]             │
│                                                 │
│  Kategorie                                     │
│  [Gefäße ▼]                                    │
│                                                 │
│  Datierung                                     │
│  [_______________________________]             │
│                                                 │
│  Beschreibung                                  │
│  [_________________________________]          │
│  [_________________________________]          │
│  [_________________________________]          │
│                                                 │
│  Breitengrad        Längengrad                 │
│  [_____________]    [_____________]           │
│                                                 │
│  [Fund speichern]                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Find Fields:
- 📝 Find title (name)
- 🏛️ Material (Bronze, Keramik, etc.)
- 📂 Category (Gefäße, Werkzeuge, Schmuck, Waffen, Objekte, Sonstiges)
- 📅 Dating (time period for the find)
- 📄 Description (detailed description)
- 🗺️ Latitude & Longitude (coordinates)

---

## Workflow Summary

### Edit Project:
1. Click **[Bearbeiten]** button
2. Modal opens with current project info
3. Change title, description, location, or period
4. Click **[Änderungen speichern]**
5. Changes saved ✅
6. Modal closes

### Add Find:
1. Click **[Öffnen]** button
2. "Add Find" modal opens
3. Enter find details (title, material, category, etc.)
4. Click **[Fund speichern]**
5. Find added to project ✅
6. Modal closes

---

## Status Check

✅ "Bearbeiten" button: Opens project edit modal
✅ "Öffnen" button: Opens find creation modal
✅ Edit form: Name, Description, Location, Period
✅ Add find form: All archaeological find fields
✅ Save functionality: Updates Firebase + UI
✅ Error handling: Shows notifications
✅ Modal closing: Works with X or after save

**Ready to use!**
