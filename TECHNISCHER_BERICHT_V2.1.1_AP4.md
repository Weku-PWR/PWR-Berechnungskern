# Technischer Bericht Version 2.1.1 – AP4

## Ziel und Umfang

AP4 automatisiert die bestehenden 21 Modul-, Robustheits- und Fachtests für den entkoppelten Berechnungskern. Die Fachlogik, die Benutzeroberfläche und die erwarteten Ergebnisse der bestehenden Testfälle wurden nicht geändert.

## Umsetzung

- `test/test-cases.js` ist die zentrale, gemeinsame Testfalldefinition. Jeder der 21 Fälle besitzt genau eine maschinenlesbare Sollwertstruktur namens `expected`; das frühere, zusätzlich gepflegte Textfeld `expectation` ist entfernt.
- `test/calculation.test.js` führt die Eingaben aus und prüft Gültigkeit, Segmente, Summen, Datumsumwandlung, Prozessende und Zeitlimit direkt gegen die jeweilige `expected`-Struktur. Electron und ein Browser werden nicht gestartet.
- `scripts/generate-test-catalog.js` leitet die lesbare Spalte „Erwartung“ deterministisch aus derselben ausführbaren `expected`-Struktur ab. `npm test` verwendet den Nur-Lese-Modus `--check` und bricht ab, wenn `TESTKATALOG.md` davon abweicht.
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
- Katalogprüfung: erfolgreich; der generierte Inhalt entspricht den ausführbaren Sollwerten aller 21 Fälle.
- Negativprobe der Katalogkopplung: `TC-001.expected.totals.wtDay` wurde temporär von 480 auf 481 geändert. Der Katalog-Check erkannte in Zeile 24 die Abweichung `8.00 WT Tag` zu `8.02 WT Tag` und lieferte Exit-Code 1. Anschließend wurde der unveränderte fachliche Sollwert 480 wiederhergestellt.
- Syntaxprüfung: erfolgreich für 9 JavaScript-Dateien.
- `npm run predist:win`: erfolgreich; Syntaxprüfung, Katalog-Check und alle 21 Tests wurden über den Lifecycle ausgeführt.
- `git diff --check`: ohne Befund.

Die Verifikation benötigt keine Browserinteraktion und keine installierten Electron-Abhängigkeiten.
