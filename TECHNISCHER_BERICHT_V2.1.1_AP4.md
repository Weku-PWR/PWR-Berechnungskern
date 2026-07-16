# Technischer Bericht Version 2.1.1 – AP4

## Ziel und Umfang

AP4 automatisiert die bestehenden 21 Modul-, Robustheits- und Fachtests für den entkoppelten Berechnungskern. Die Fachlogik, die Benutzeroberfläche und die erwarteten Ergebnisse der bestehenden Testfälle wurden nicht geändert.

## Umsetzung

- `test/test-cases.js` ist die einzige ausführbare Testfalldefinition. Sie exportiert dieselben 21 Fälle browserkompatibel und für Node.js; die frühere zweite Fachtestliste mit separaten `expect`-Werten in `app.js` ist entfernt.
- `test/calculation.test.js` führt die Eingaben aus und prüft Gültigkeit, Fehlermeldung, Folgetag, alle Summenkategorien, Total, definierte Segmentwerte, Datumsumwandlung, Prozessende und Zeitlimit direkt gegen die jeweilige `expected`-Struktur.
- Die sichtbare Prüfoberfläche lädt `test/test-cases.js`, führt alle 21 kanonischen Fälle aus und enthält keine eigenen fachlichen Sollwerte mehr. Die Datei wird vom Electron-Build und vom Offline-Cache mit ausgeliefert.
- `scripts/generate-test-catalog.js` serialisiert die vollständige Definition deterministisch und verlustfrei. Eingaben, Sollwerte und Sonderwerte wie `undefined`, `NaN` und `Invalid Date` werden in `TESTKATALOG.md` maschinenlesbar und typmarkiert abgelegt; Zahlen werden nicht gerundet. `npm test` verwendet den Nur-Lese-Modus `--check` und bricht bei jeder Abweichung ab.
- `scripts/check-syntax.js` prüft alle JavaScript-Dateien des Projekts mit `node --check`; Build-Ausgaben, Git-Daten und installierte Abhängigkeiten werden ausgelassen.
- `npm run verify` verbindet Syntaxprüfung und Testsuite.
- Der Lifecycle-Hook `predist:win` startet `npm run verify` vor dem bestehenden Windows-Build. Ein Syntax- oder Testfehler verhindert damit die Paketierung und liefert einen Exit-Code ungleich null.

## npm-Befehle

| Befehl | Zweck |
|---|---|
| `npm test` | Katalog-Synchronität prüfen und exakt 21 Tests ausführen |
| `npm run test:catalog` | `TESTKATALOG.md` aus der zentralen Definition regenerieren |
| `npm run syntax` | Syntax aller JavaScript-Dateien prüfen |
| `npm run verify` | Syntaxprüfung und Testsuite als gemeinsame Build-Sperre ausführen |
| `npm run predist:win` | Dieselbe Build-Sperre als Lifecycle-Prüfung ausführen |
| `npm run dist:win` | Vor der Paketierung automatisch `npm run verify` ausführen |

## Verifikation

- Testsuite: 21 ausgeführt, 21 bestanden, 0 fehlgeschlagen.
- Sichtbare Prüfoberfläche: 21 Zeilen von `MT-001` bis `TC-013`, Ergebnis „21 von 21 Testfällen korrekt“, keine Fehlerzelle und keine Browserfehler.
- Katalogprüfung: erfolgreich; die vollständige typmarkierte Definition entspricht den ausführbaren Eingaben und Sollwerten aller 21 Fälle.
- Vier isolierte Negativproben der Katalogkopplung lieferten jeweils Exit-Code 1: `TC-001.expected.valid` von `true` auf `false`, `TC-001.expected.totals.wtDay` von `480` auf `480.1`, `TC-001.expected.segments[0].duration` von `480` auf `480.1` und `MT-008.expected.exitCode` von `0` auf `1`. Die Proben erfolgten nur im Speicher; die versionierten Sollwerte blieben unverändert.
- Syntaxprüfung: erfolgreich für 9 JavaScript-Dateien.
- `npm run predist:win`: erfolgreich; Syntaxprüfung, Katalog-Check und alle 21 Tests wurden über den Lifecycle ausgeführt.
- `git diff --check`: ohne Befund.

Die Verifikation benötigt keine Browserinteraktion und keine installierten Electron-Abhängigkeiten.
