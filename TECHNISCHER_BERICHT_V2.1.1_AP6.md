# Technischer Bericht Version 2.1.1 – AP6

## Ziel und Umfang

AP6 finalisiert die Eingabeoberfläche und die Detailansicht. Die Fachlogik in `calculation.js`, die fachlichen Sollwerte und die Produktfunktionen wurden nicht geändert.

## Umsetzung

- Der Umschaltbutton für den Rechenweg liegt dauerhaft sichtbar in der Detailansicht. Ohne gültiges Ergebnis ist er deaktiviert und zeigt den eingeklappten Zustand.
- Eine gültige Berechnung aktiviert und öffnet den Rechenweg. Der Button kann danach beliebig oft zwischen „Rechenweg anzeigen“ und „Rechenweg ausblenden“ wechseln.
- `aria-expanded` wird bei jedem Zustandswechsel synchron gesetzt. `aria-controls="detailTableWrap"` verweist eindeutig auf den ein- und ausgeblendeten Tabellenbereich.
- Das Datum bleibt über Stern, sichtbaren Text „Pflichtfeld“, das native `required`-Attribut und einen barrierefreien Pflichtfeldhinweis gekennzeichnet.
- Validierungsfehler erscheinen zusätzlich zur Zusammenfassung direkt am betroffenen Feld. Die zugehörigen Steuerelemente erhalten `aria-invalid="true"` und verweisen über `aria-describedby` auf ihre konkrete Fehlermeldung.
- Bei identischen Uhrzeiten werden Beginn und Ende getrennt und verständlich erklärt.
- Der Hinweis „Ende liegt am Folgetag“ erscheint eindeutig am Endefeld, sobald die Endzeit vor der Startzeit liegt.
- Zurücksetzen stellt Datum, Feiertag, Beginn und Ende auf den Ausgangszustand, entfernt Fehler und `aria-invalid`, blendet den Folgetag-Hinweis aus, leert Ergebnis und Rechenweg und setzt den Detailbutton auf deaktiviert/eingeklappt zurück.
- Der Service-Worker-Cache wurde auf AP6 angehoben, damit die aktualisierte Oberfläche auch offline ausgeliefert wird.

## UI-Prüfung

- Mausbedienung: Berechnen, Zurücksetzen und wiederholtes Ein-/Ausblenden des Rechenwegs erfolgreich geprüft.
- Tastaturzugänglichkeit: Datum, Auswahllisten, Kontrollkästchen und Buttons sind native, fokussierbare Bedienelemente; die Aktionsbuttons einschließlich Detailumschaltung liegen mit `tabIndex 0` in der normalen Tab-Reihenfolge.
- Pflichtfeldfehler: Fokus springt auf das Datum; sichtbare Feldmeldung, Fehlerzusammenfassung, `aria-invalid` und `aria-describedby` sind konsistent.
- Zeitfehler: Bei Beginn gleich Ende werden beide Felder markiert und jeweils feldbezogen erklärt.
- Folgetag: Bei 22:00–05:00 ist der Hinweis „Ende liegt am Folgetag“ sichtbar.
- Detailansicht: geöffnet → geschlossen → erneut geöffnet; Text, Sichtbarkeit und `aria-expanded` wechselten jeweils synchron, `aria-controls` blieb korrekt.
- Reset wurde nach einer gültigen Folgetag-Berechnung mit aktivierter Feiertagsoption ausgeführt; alle Eingaben, Fehler, Hinweise, Resultate, Tabellenzeilen und Detailzustände waren anschließend zurückgesetzt.
- 375 px: kein horizontaler Seitenüberlauf; Eingaben und Aktionsbuttons vollständig innerhalb der 375-px-Ansicht; breite Detailtabelle scrollt ausschließlich in ihrem Tabellencontainer.
- 320 px: kein horizontaler Seitenüberlauf; Eingaben und Aktionsbuttons vollständig innerhalb der 320-px-Ansicht; breite Detailtabelle scrollt ausschließlich in ihrem Tabellencontainer.
- Browserkonsole: keine Warnungen und keine Fehler.
- Sichtbare Prüffälle: 20/20 Browser-Tests bestanden; MT-008 weiterhin korrekt als ausschließlich automatisiert ausgewiesen.

## Automatisierte Verifikation

- Node-Tests: 21 ausgeführt, 21 bestanden, 0 fehlgeschlagen.
- Syntaxprüfung: erfolgreich für 9 JavaScript-Dateien.
- Katalogprüfung: erfolgreich; `TESTKATALOG.md` entspricht unverändert der zentralen Definition.
- `predist:win`: vollständige Lifecycle-Kette aus Syntaxprüfung, Katalogprüfung und 21 Node-Tests erfolgreich.
- `git diff --check`: ohne Befund.

## Geänderte Dateien

- `index.html`: dauerhaft sichtbarer Detailbutton, ARIA-Verknüpfungen, feldbezogene Fehlermeldungen und eindeutiger Folgetag-Hinweis
- `app.js`: synchroner Detailzustand, feldbezogene Validierung und vollständiger Reset
- `styles.css`: Darstellung der Feldfehler und des deaktivierten Detailbuttons
- `sw.js`: AP6-Cachekennung
- `TECHNISCHER_BERICHT_V2.1.1_AP6.md`: technische Dokumentation
