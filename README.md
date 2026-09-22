
# BED-Con 2026 – Talk-Selector

Kleine Vue-3-App, mit der man sich aus dem offiziellen Programm der
[Berlin Expert Days 2026](https://bed-con.org/2026/programm) sein eigenes Programm
zusammenstellt. Optik und Farben orientieren sich am Stylesheet der Konferenzseite.

## Start

```bash
npm install
npm run dev
```

Produktiv-Build (statische Dateien in `dist/`, mit relativen Pfaden – also auch in einem
Unterverzeichnis lauffähig):

```bash
npm run build
npm run preview
```

## GitHub Pages

Bei jedem Push auf `main` baut GitHub Actions die App und veröffentlicht den Inhalt von `dist/`
auf GitHub Pages. Die Seite ist anschließend unter
`https://qvest-digital.github.io/bed-con-talk-selector/` erreichbar.
Die Veröffentlichung funktioniert, weil Vite in `vite.config.js` mit `base: './'` konfiguriert
ist und die Build-Artefakte dadurch mit relativen Pfaden auch im Repository-Unterverzeichnis von
GitHub Pages laufen.

## Funktionen

- **Links „Mein Programm“**, rechts das Konferenzprogramm nach den beiden Tagen getrennt
  (Tag-Umschalter, Räume als Spalten wie im offiziellen Raster).
- **Suche** über Titel, Beschreibung, Speaker und Raum. Bei aktiver Suche werden beide Tage
  durchsucht, Treffer werden im Titel hervorgehoben.
- **Slot-Auswahl:** Ein Klick übernimmt den Talk in das eigene Programm – mit Titel,
  Beschreibung, Start, Ende, Raum und Speakern.
- **Short Talks:** Mehrere kurze Talks im selben Zeitfenster und Raum werden zu einem
  Slot-Block zusammengefasst und gemeinsam übernommen.
- **Ein Slot, eine Auswahl:** Wird in einem Zeitfenster ein anderer Raum gewählt, ersetzt
  dieser die bisherige Auswahl (parallele Talks lassen sich nicht doppelt besuchen). Die
  Karten zeigen vorab an, was ersetzt würde.
- **Persistenz:** Die Auswahl liegt im `localStorage` des Browsers.
- **Export:** `.ics` für den Kalender (inkl. `VTIMEZONE` Europe/Berlin), JSON, Druckansicht
  (druckt nur das eigene Programm) und ein Link zum Teilen der Auswahl (`#p=…`).

## Datenquelle

Das Programm wird zur Laufzeit direkt aus der Sessionize-API geladen:

```
https://sessionize.com/api/v2/ae9h84td/view/GridSmart
```

Die API liefert CORS-Header (`Access-Control-Allow-Origin: *`), ein Proxy ist also nicht nötig.
Kurze Talks tauchen dort als eigene Zeitschienen auf (z. B. 11:40, 12:00, 12:20 im selben
Raum); `src/lib/sessionize.js` fasst überlappende Talks wieder zu einem Slot zusammen.

## Aufbau

```
src/
  App.vue                     Layout, Suche, Tag-Auswahl, Hinweis-Toasts
  components/
    AppHeader.vue             Kopfbereich im Stil der Konferenzseite
    SearchBar.vue             Suchfeld inkl. Trefferzähler
    DayTabs.vue               Umschalter Tag 1 / Tag 2
    ProgramGrid.vue           Raster eines Tages (Zeitschiene + Raumspalten)
    SlotEntry.vue             Talk- bzw. Short-Talk-Block-Karte
    MyProgramPanel.vue        „Mein Programm“ inkl. Export-Aktionen
    HighlightText.vue         Hervorhebung der Suchtreffer
  composables/
    useProgramData.js         Laden des Programms (inkl. Fehler-/Ladezustand)
    useMyProgram.js           Auswahl, Persistenz, Share-Link
  lib/
    sessionize.js             Normalisierung der Sessionize-Daten
    search.js  ics.js  format.js  download.js
  styles/base.css             Design-Tokens der Konferenzseite + Druckstile
```

Inoffizielles Hilfsmittel – die Auswahl verlässt den Browser nicht.
