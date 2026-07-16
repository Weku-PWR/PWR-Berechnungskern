# Technischer Bericht – Version 2.1.1, AP3

## Ausgangslage und Umfang

- Branch: `feature/v2.1.1-ap3`
- Basis: `origin/main` (`df4bc25`)
- Ziel: Benutzeroberfläche und Benutzerführung der vorhandenen Eingabevalidierung verbessern
- Unverändert: Berechnungslogik, Fachregeln und bestehende Testfälle

## Umsetzung

### Eingabevalidierung

- Das Datum ist sichtbar und technisch als Pflichtfeld gekennzeichnet.
- Für fehlendes oder ungültiges Datum, ungültige Beginn-/Endstunden, ungültige Minuten und identische Beginn-/Endzeiten werden verständliche, eingabespezifische Meldungen angezeigt.
- Betroffene Felder erhalten eine rote Markierung, einen Fokusrahmen und `aria-invalid="true"`.
- Die Fehlermeldung wird als zugängliche Live-Meldung ausgegeben.

### Ergebniszustände

- Beim Start werden keine berechneten Nullwerte mehr dargestellt.
- Nach jeder Eingabeänderung werden vorhandene Ergebniswerte und Rechenwegzeilen sofort aus dem DOM-Inhalt entfernt und die Ergebnisbereiche ausgeblendet.
- Bei ungültigen Eingaben bleiben Ergebnis und Rechenweg ausgeblendet; es werden keine Ersatzwerte wie `0.00 h` als vermeintliches Resultat angezeigt.
- Ergebnis und Rechenweg werden ausschließlich nach einer gültigen, explizit ausgelösten Berechnung eingeblendet.

### Folgetag und Reset

- Liegt die Endzeit vor der Beginnzeit, erscheint direkt am Feld „Ende“ der Hinweis „am Folgetag“.
- Im gültigen Ergebnis wird zusätzlich „Ende am Folgetag: Ja/Nein“ angezeigt.
- Reset stellt den definierten Ausgangszustand wieder her: Datum leer, Feiertag deaktiviert, Beginn `06:00`, Ende `18:00`, keine Fehler, keine Feldmarkierungen, kein Folgetag-Hinweis, keine Resultatwerte und kein Rechenweg.

### Rechenweg

- Der Rechenweg besitzt einen neutralen Leerzustand.
- Die Schaltfläche zum Ein-/Ausblenden bleibt außerhalb der ausgeblendeten Tabelle bedienbar und pflegt `aria-expanded`.

## Geänderte Dateien

- `index.html`: Pflichtfeld-, Status-, Ergebnis- und Rechenwegstruktur
- `app.js`: UI-Validierung, Zustandsbereinigung, Folgetag-Hinweis und vollständiger Reset
- `styles.css`: Pflichtfeld-, Fehler-, Leerzustands- und Folgetagdarstellung

`calculation.js`, das Fachregelwerk und `test/calculation.test.js` wurden nicht geändert.

## Prüfprotokoll

### Automatisierte Tests

Ausgeführt mit der gebündelten Node.js-Laufzeit:

```text
node --test
Tests: 21
Bestanden: 21
Fehlgeschlagen: 0
```

- Modultests Eingabevalidierung: 8 von 8 bestanden
- Fachtests TC-001 bis TC-013: 13 von 13 bestanden

### Syntaxprüfung

`node --check` war erfolgreich für:

- `app.js`
- `calculation.js`
- `main.js`
- `preload.js`
- `sw.js`

### UI-Prüfung

Im lokalen Browser wurden folgende Zustände geprüft:

- fehlendes Pflichtdatum: verständliche Meldung, Datumsfeld markiert, keine Resultate
- gültige Berechnung über Mitternacht: Folgetag-Hinweis sichtbar, korrektes Ergebnis und Rechenweg
- Eingabeänderung nach gültiger Berechnung: alte Werte vollständig entfernt
- identische Beginn-/Endzeit: beide Zeitfelder markiert, keine Resultate
- Reset: sämtliche Eingaben, Fehler, Markierungen, Resultate und Rechenweg im Ausgangszustand
- Browser-Konsole: keine Warnungen oder Fehler

### Repository-Prüfung

- `git diff --check`: erfolgreich
- Diff gegen Berechnungslogik und Testdatei: leer

## Bewertung

Die Änderung beschränkt sich auf Darstellung und Steuerung der vorhandenen Eingabevalidierung. Die fachliche Berechnung und deren Regeln bleiben unverändert und werden durch die vollständig bestandenen Fachtests bestätigt.
