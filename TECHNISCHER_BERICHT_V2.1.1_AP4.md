# Technischer Bericht Version 2.1.1 – AP4

## Ziel und Umfang

AP4 automatisiert die bestehenden 21 Modul-, Robustheits- und Fachtests für den entkoppelten Berechnungskern. Die Fachlogik, die Benutzeroberfläche und die erwarteten Ergebnisse der bestehenden Testfälle wurden nicht geändert.

## Umsetzung

- `test/test-cases.js` ist die zentrale, gemeinsame Testfalldefinition. Sie enthält Kennung, Gruppe, Eingaben und erwartetes Ergebnis aller 21 Fälle.
- `test/calculation.test.js` führt diese Definition mit dem integrierten Node-Test-Runner aus. Electron und ein Browser werden nicht gestartet.
- `scripts/generate-test-catalog.js` erzeugt `TESTKATALOG.md` aus derselben Definition. `npm test` verwendet den Nur-Lese-Modus `--check` und bricht ab, wenn Katalog und Testsuite voneinander abweichen.
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
| `npm run dist:win` | Vor der Paketierung automatisch `npm run verify` ausführen |

## Verifikation

- Testsuite: 21 ausgeführt, 21 bestanden, 0 fehlgeschlagen.
- Katalogprüfung: erfolgreich; alle 21 ausführbaren Fälle sind dokumentiert.
- Syntaxprüfung: erfolgreich für alle JavaScript-Dateien.
- Negativprobe des Node-Test-Runners: ein absichtlich fehlschlagender Test liefert Exit-Code 1.
- `git diff --check`: ohne Befund.

Die Verifikation benötigt keine Browserinteraktion und keine installierten Electron-Abhängigkeiten.
