# PWR Testkatalog 2.1.1

<!-- Generiert aus test/test-cases.js; nicht manuell bearbeiten. -->

Die ausführbare Testsuite umfasst 21 Testfälle.

## Modul- und Robustheitstests

| ID | Fall | Erwartung |
|---|---|---|
| MT-001 | Startstunde -1 | Eingabe ungültig; keine Segmente |
| MT-002 | Endstunde 24 | Eingabe ungültig; keine Segmente |
| MT-003 | Startstunde 6.5 bzw. "6"; Endstunde NaN | Eingabe ungültig; keine Segmente |
| MT-004 | Datum fehlt bzw. ist Invalid Date | Eingabe ungültig; keine Segmente |
| MT-005 | 30.02.2026 | Datumsumwandlung liefert Invalid Date; Berechnung ist ungültig |
| MT-006 | Startminute 5, 15.5 bzw. "15" | Eingabe ungültig; keine Segmente |
| MT-007 | Beginn und Ende 06:00 | Eingabe ungültig; keine Segmente |
| MT-008 | Berechnung mit negativer Startstunde in separatem Node-Prozess | Prozess terminiert innerhalb 1 s und bestätigt die ungültige Eingabe |

## Fachtests

| ID | Fall | Erwartung |
|---|---|---|
| TC-001 | Montag 06:00–14:00 | 8.00 WT Tag |
| TC-002 | Montag 18:00–22:00 | 2.00 WT Tag + 2.00 WT Nacht |
| TC-003 | Samstag 14:00–22:00 | 3.00 WT Tag + 3.00 So/FT Tag + 2.00 So/FT Nacht |
| TC-004 | Samstag 22:00–Sonntag 06:00 | 8.00 So/FT Nacht |
| TC-005 | Sonntag 08:00–16:00 | 8.00 So/FT Tag |
| TC-006 | Sonntag 20:00–Montag 07:00 | 10.00 So/FT Nacht + 1.00 WT Tag |
| TC-007 | Sonntag 23:45–Montag 06:00 | 6.25 So/FT Nacht |
| TC-008 | Montag 00:00–07:00 | 6.00 WT Nacht + 1.00 WT Tag |
| TC-009 | Samstag 16:00–Sonntag 07:00 | 1.00 WT Tag + 4.00 So/FT Tag + 10.00 So/FT Nacht |
| TC-010 | Freitag 22:00–Samstag 06:00 | 8.00 WT Nacht |
| TC-011 | Feiertag 18:00–07:00 | 3.00 So/FT Tag + 10.00 So/FT Nacht |
| TC-012 | Dienstag 18:30–Mittwoch 07:15 | 2.75 WT Tag + 10.00 WT Nacht |
| TC-013 | 06:00–06:00 | ungültig |
