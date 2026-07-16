# Technischer Bericht Version 2.1.1 – AP5

## Ziel und Umfang

AP5 stellt die sichtbare Prüfoberfläche für die bestehenden 21 zentralen Modul-, Robustheits- und Fachtests fertig. Die Fachlogik, die fachlichen Sollwerte und die übrigen Produktfunktionen wurden nicht geändert.

## Umsetzung

- Die Prüfoberfläche bezieht weiterhin defaultInput und testCases ausschließlich aus test/test-cases.js. Es wurde keine zweite Testfall- oder Sollwertdefinition eingeführt.
- Soll- und Istwerte werden in getrennten, eindeutig bezeichneten Spalten als gleichartig aufgebaute Merkmalslisten dargestellt. Gültigkeit, Meldungen, Zeitkategorien, Total, Folgetag, Segmente, Kalenderdatum, Exit-Code und Laufzeit erscheinen entsprechend dem jeweiligen zentralen Sollobjekt.
- Abweichende Istmerkmale, fehlgeschlagene Zeilen und fehlgeschlagene Testkategorien erhalten eigenständige rote Markierungen. Der Gesamtstatus ist als grüne oder rote Statusfläche ausgeführt.
- Die Zusammenfassung nennt bestandene und fehlgeschlagene Fälle. Zusätzlich werden die vorhandenen zentralen Testgruppen mit ihrem jeweiligen Ergebnis dargestellt.
- Der optionale Filter „Nur fehlgeschlagene Fälle“ blendet bestandene Zeilen aus und zeigt bei vollständig erfolgreicher Prüfung einen verständlichen Leerzustand.
- Alle dynamisch dargestellten Inhalte der zentralen Testfalldefinition werden vor der HTML-Ausgabe maskiert.
- MT-008 wird anhand seiner zentral definierten Testfallart `termination` vor der Browser-Ausführung ausgesondert. Die Prüfoberfläche ruft für diesen Fall weder `calculate` auf noch erzeugt sie einen künstlichen Exit-Code oder eine Browser-Laufzeit.
- Die Zeile MT-008 zeigt den erwarteten Status, den zuletzt bekannten automatisierten Testerfolg und den Hinweis, dass die echte Terminierungsprüfung im separaten Node-Prozess mit 1000-ms-Timeout ausschließlich über `npm test` beziehungsweise `node --test` erfolgt.
- Gesamtstatus, Kategorien und Filter unterscheiden zwischen 20 im Browser ausgeführten Tests und einem ausschließlich automatisiert ausführbaren Robustheitstest. Es wurde keine zusätzliche Testdefinition oder Sollwertquelle eingeführt; `test/test-cases.js` bleibt maßgeblich.
- Der Service-Worker-Cache wurde auf AP5 angehoben, damit die aktualisierte Oberfläche auch offline ausgeliefert wird.

## Verifikation

- Testsuite: 21 ausgeführt, 21 bestanden, 0 fehlgeschlagen.
- Syntaxprüfung: erfolgreich für 9 JavaScript-Dateien.
- Katalogprüfung: erfolgreich; TESTKATALOG.md entspricht unverändert der zentralen Definition.
- Sichtbare Prüfoberfläche im Browser: alle 21 IDs von MT-001 bis TC-013; Gesamtstatus 20/20 Browser-Tests bestanden und 1 nur automatisiert ausführbarer Test; Kategorien „Modul- und Robustheitstests“ 7/7 im Browser plus 1 nur automatisiert sowie „Fachtests“ 13/13 im Browser.
- MT-008: nicht im Browser ausgeführt; Status „Nur automatisiert“, erwarteter Status und letzter bekannter automatisierter Testerfolg sichtbar, eindeutiger Hinweis auf `npm test` beziehungsweise `node --test` und den separaten Node-Prozess mit 1000-ms-Timeout.
- Filter „Nur fehlgeschlagene Fälle“: 0 fehlgeschlagene von 20 Browser-Tests, verständlicher Leerzustand und separater Hinweis auf 1 nur automatisiert ausführbaren Test.
- Browserkonsole: keine Warnungen und keine Fehler.
- git diff --check: ohne Befund.
- predist:win: vollständige Lifecycle-Kette `predist:win` → `verify` → Syntaxprüfung, Katalogprüfung und 21 Node-Tests erfolgreich ausgeführt.

## Geänderte Dateien

- index.html: Bedienung, Zusammenfassung, Kategorieübersicht und eindeutige Tabellenspalten
- app.js: datengetriebene Aufbereitung, Vergleichsmarkierung, Zusammenfassung und Filter
- styles.css: Status-, Vergleichs-, Kategorie- und Filterdarstellung
- sw.js: AP5-Cachekennung
- TECHNISCHER_BERICHT_V2.1.1_AP5.md: technische Dokumentation
