# PWR Testkatalog 2.1.1

<!-- Generiert aus test/test-cases.js; nicht manuell bearbeiten. -->

Die ausführbare Testsuite umfasst 21 Testfälle.

## Modul- und Robustheitstests

| ID | Fall | Eingaben (verlustfrei) | Erwartung (verlustfrei) |
|---|---|---|---|
| MT-001 | Startstunde -1 | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"startHour":-1}]} | {"error":"Stunden müssen ganzzahlig zwischen 0 und 23 liegen.","segments":{"$type":"undefined"},"valid":false} |
| MT-002 | Endstunde 24 | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"endHour":24}]} | {"error":"Stunden müssen ganzzahlig zwischen 0 und 23 liegen.","segments":{"$type":"undefined"},"valid":false} |
| MT-003 | Startstunde 6.5 bzw. "6"; Endstunde NaN | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"startHour":6.5},{"startHour":"6"},{"endHour":{"$type":"number","value":"NaN"}}]} | {"error":"Stunden müssen ganzzahlig zwischen 0 und 23 liegen.","segments":{"$type":"undefined"},"valid":false} |
| MT-004 | Datum fehlt bzw. ist Invalid Date | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"date":{"$type":"undefined"}},{"date":{"$type":"date","value":"Invalid Date"}}]} | {"error":"Das Datum fehlt oder ist kein reales Kalenderdatum.","segments":{"$type":"undefined"},"valid":false} |
| MT-005 | 30.02.2026 | {"date":"2026-02-30","defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0}} | {"dateIsInvalid":true,"error":"Das Datum fehlt oder ist kein reales Kalenderdatum.","segments":{"$type":"undefined"},"valid":false} |
| MT-006 | Startminute 5, 15.5 bzw. "15" | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"startMinute":5},{"startMinute":15.5},{"startMinute":"15"}]} | {"error":"Es sind nur die Minuten 00, 15, 30 oder 45 zulässig.","segments":{"$type":"undefined"},"valid":false} |
| MT-007 | Beginn und Ende 06:00 | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"endHour":6}]} | {"error":"Beginn und Ende dürfen nicht identisch sein.","segments":{"$type":"undefined"},"valid":false} |
| MT-008 | Berechnung mit negativer Startstunde in separatem Node-Prozess | {"date":"2026-07-13","endHour":1,"endMinute":0,"holiday":false,"startHour":-1,"startMinute":0} | {"completesWithinMs":1000,"error":"Stunden müssen ganzzahlig zwischen 0 und 23 liegen.","exitCode":0,"valid":false} |

## Fachtests

| ID | Fall | Eingaben (verlustfrei) | Erwartung (verlustfrei) |
|---|---|---|---|
| TC-001 | Montag 06:00–14:00 | {"date":"2026-07-13","end":"14:00","holiday":false,"start":"06:00"} | {"overnight":false,"segments":[{"category":"wtDay","duration":480,"from":"06:00","reason":"Normaler Wochentag · Tagzeit 06:00–20:00","to":"14:00"}],"total":480,"totals":{"sfDay":0,"sfNight":0,"wtDay":480,"wtNight":0},"valid":true} |
| TC-002 | Montag 18:00–22:00 | {"date":"2026-07-13","end":"22:00","holiday":false,"start":"18:00"} | {"overnight":false,"total":240,"totals":{"sfDay":0,"sfNight":0,"wtDay":120,"wtNight":120},"valid":true} |
| TC-003 | Samstag 14:00–22:00 | {"date":"2026-07-18","end":"22:00","holiday":false,"start":"14:00"} | {"overnight":false,"total":480,"totals":{"sfDay":180,"sfNight":120,"wtDay":180,"wtNight":0},"valid":true} |
| TC-004 | Samstag 22:00–Sonntag 06:00 | {"date":"2026-07-18","end":"06:00","holiday":false,"start":"22:00"} | {"overnight":true,"total":480,"totals":{"sfDay":0,"sfNight":480,"wtDay":0,"wtNight":0},"valid":true} |
| TC-005 | Sonntag 08:00–16:00 | {"date":"2026-07-19","end":"16:00","holiday":false,"start":"08:00"} | {"overnight":false,"total":480,"totals":{"sfDay":480,"sfNight":0,"wtDay":0,"wtNight":0},"valid":true} |
| TC-006 | Sonntag 20:00–Montag 07:00 | {"date":"2026-07-19","end":"07:00","holiday":false,"start":"20:00"} | {"overnight":true,"total":660,"totals":{"sfDay":0,"sfNight":600,"wtDay":60,"wtNight":0},"valid":true} |
| TC-007 | Sonntag 23:45–Montag 06:00 | {"date":"2026-07-19","end":"06:00","holiday":false,"start":"23:45"} | {"overnight":true,"total":375,"totals":{"sfDay":0,"sfNight":375,"wtDay":0,"wtNight":0},"valid":true} |
| TC-008 | Montag 00:00–07:00 | {"date":"2026-07-20","end":"07:00","holiday":false,"start":"00:00"} | {"overnight":false,"total":420,"totals":{"sfDay":0,"sfNight":0,"wtDay":60,"wtNight":360},"valid":true} |
| TC-009 | Samstag 16:00–Sonntag 07:00 | {"date":"2026-07-18","end":"07:00","holiday":false,"start":"16:00"} | {"overnight":true,"total":900,"totals":{"sfDay":240,"sfNight":600,"wtDay":60,"wtNight":0},"valid":true} |
| TC-010 | Freitag 22:00–Samstag 06:00 | {"date":"2026-07-17","end":"06:00","holiday":false,"start":"22:00"} | {"overnight":true,"total":480,"totals":{"sfDay":0,"sfNight":0,"wtDay":0,"wtNight":480},"valid":true} |
| TC-011 | Feiertag 18:00–07:00 | {"date":"2026-07-14","end":"07:00","holiday":true,"start":"18:00"} | {"overnight":true,"total":780,"totals":{"sfDay":180,"sfNight":600,"wtDay":0,"wtNight":0},"valid":true} |
| TC-012 | Dienstag 18:30–Mittwoch 07:15 | {"date":"2026-07-14","end":"07:15","holiday":false,"start":"18:30"} | {"overnight":true,"total":765,"totals":{"sfDay":0,"sfNight":0,"wtDay":165,"wtNight":600},"valid":true} |
| TC-013 | 06:00–06:00 | {"defaultInput":{"date":"2026-07-13","endHour":14,"endMinute":0,"holiday":false,"startHour":6,"startMinute":0},"scenarios":[{"endHour":6,"startHour":6}]} | {"error":"Beginn und Ende dürfen nicht identisch sein.","segments":{"$type":"undefined"},"valid":false} |

## Maschinenlesbare kanonische Definition

Die folgende Darstellung enthält die vollständigen ausführbaren Eingaben und Sollwerte. Sonderwerte wie `undefined`, `NaN` und ungültige Datumswerte sind typmarkiert.

```json
{
  "defaultInput": {
    "date": "2026-07-13",
    "endHour": 14,
    "endMinute": 0,
    "holiday": false,
    "startHour": 6,
    "startMinute": 0
  },
  "testCases": [
    {
      "description": "Startstunde -1",
      "expected": {
        "error": "Stunden müssen ganzzahlig zwischen 0 und 23 liegen.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-001",
      "kind": "invalid-input",
      "scenarios": [
        {
          "startHour": -1
        }
      ],
      "title": "Negative Stunden werden abgelehnt"
    },
    {
      "description": "Endstunde 24",
      "expected": {
        "error": "Stunden müssen ganzzahlig zwischen 0 und 23 liegen.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-002",
      "kind": "invalid-input",
      "scenarios": [
        {
          "endHour": 24
        }
      ],
      "title": "Stunde 24 wird abgelehnt"
    },
    {
      "description": "Startstunde 6.5 bzw. \"6\"; Endstunde NaN",
      "expected": {
        "error": "Stunden müssen ganzzahlig zwischen 0 und 23 liegen.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-003",
      "kind": "invalid-input",
      "scenarios": [
        {
          "startHour": 6.5
        },
        {
          "startHour": "6"
        },
        {
          "endHour": {
            "$type": "number",
            "value": "NaN"
          }
        }
      ],
      "title": "Gebrochene und nichtnumerische Stunden werden abgelehnt"
    },
    {
      "description": "Datum fehlt bzw. ist Invalid Date",
      "expected": {
        "error": "Das Datum fehlt oder ist kein reales Kalenderdatum.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-004",
      "kind": "invalid-input",
      "scenarios": [
        {
          "date": {
            "$type": "undefined"
          }
        },
        {
          "date": {
            "$type": "date",
            "value": "Invalid Date"
          }
        }
      ],
      "title": "Fehlendes und ungültiges Datum werden abgelehnt"
    },
    {
      "date": "2026-02-30",
      "description": "30.02.2026",
      "expected": {
        "dateIsInvalid": true,
        "error": "Das Datum fehlt oder ist kein reales Kalenderdatum.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-005",
      "kind": "invalid-calendar-date",
      "title": "Nicht existierendes Kalenderdatum wird abgelehnt"
    },
    {
      "description": "Startminute 5, 15.5 bzw. \"15\"",
      "expected": {
        "error": "Es sind nur die Minuten 00, 15, 30 oder 45 zulässig.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-006",
      "kind": "invalid-input",
      "scenarios": [
        {
          "startMinute": 5
        },
        {
          "startMinute": 15.5
        },
        {
          "startMinute": "15"
        }
      ],
      "title": "Ungültige, gebrochene und nichtnumerische Minuten werden abgelehnt"
    },
    {
      "description": "Beginn und Ende 06:00",
      "expected": {
        "error": "Beginn und Ende dürfen nicht identisch sein.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-007",
      "kind": "invalid-input",
      "scenarios": [
        {
          "endHour": 6
        }
      ],
      "title": "Beginn gleich Ende wird abgelehnt"
    },
    {
      "description": "Berechnung mit negativer Startstunde in separatem Node-Prozess",
      "expected": {
        "completesWithinMs": 1000,
        "error": "Stunden müssen ganzzahlig zwischen 0 und 23 liegen.",
        "exitCode": 0,
        "valid": false
      },
      "group": "Modul- und Robustheitstests",
      "id": "MT-008",
      "input": {
        "date": "2026-07-13",
        "endHour": 1,
        "endMinute": 0,
        "holiday": false,
        "startHour": -1,
        "startMinute": 0
      },
      "kind": "termination",
      "title": "Ungültige Eingaben terminieren garantiert"
    },
    {
      "date": "2026-07-13",
      "description": "Montag 06:00–14:00",
      "end": "14:00",
      "expected": {
        "overnight": false,
        "segments": [
          {
            "category": "wtDay",
            "duration": 480,
            "from": "06:00",
            "reason": "Normaler Wochentag · Tagzeit 06:00–20:00",
            "to": "14:00"
          }
        ],
        "total": 480,
        "totals": {
          "sfDay": 0,
          "sfNight": 0,
          "wtDay": 480,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-001",
      "kind": "calculation",
      "start": "06:00",
      "title": "Montag 06:00–14:00"
    },
    {
      "date": "2026-07-13",
      "description": "Montag 18:00–22:00",
      "end": "22:00",
      "expected": {
        "overnight": false,
        "total": 240,
        "totals": {
          "sfDay": 0,
          "sfNight": 0,
          "wtDay": 120,
          "wtNight": 120
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-002",
      "kind": "calculation",
      "start": "18:00",
      "title": "Montag 18:00–22:00"
    },
    {
      "date": "2026-07-18",
      "description": "Samstag 14:00–22:00",
      "end": "22:00",
      "expected": {
        "overnight": false,
        "total": 480,
        "totals": {
          "sfDay": 180,
          "sfNight": 120,
          "wtDay": 180,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-003",
      "kind": "calculation",
      "start": "14:00",
      "title": "Samstag 14:00–22:00"
    },
    {
      "date": "2026-07-18",
      "description": "Samstag 22:00–Sonntag 06:00",
      "end": "06:00",
      "expected": {
        "overnight": true,
        "total": 480,
        "totals": {
          "sfDay": 0,
          "sfNight": 480,
          "wtDay": 0,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-004",
      "kind": "calculation",
      "start": "22:00",
      "title": "Samstag 22:00–Sonntag 06:00"
    },
    {
      "date": "2026-07-19",
      "description": "Sonntag 08:00–16:00",
      "end": "16:00",
      "expected": {
        "overnight": false,
        "total": 480,
        "totals": {
          "sfDay": 480,
          "sfNight": 0,
          "wtDay": 0,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-005",
      "kind": "calculation",
      "start": "08:00",
      "title": "Sonntag 08:00–16:00"
    },
    {
      "date": "2026-07-19",
      "description": "Sonntag 20:00–Montag 07:00",
      "end": "07:00",
      "expected": {
        "overnight": true,
        "total": 660,
        "totals": {
          "sfDay": 0,
          "sfNight": 600,
          "wtDay": 60,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-006",
      "kind": "calculation",
      "start": "20:00",
      "title": "Sonntag 20:00–Montag 07:00"
    },
    {
      "date": "2026-07-19",
      "description": "Sonntag 23:45–Montag 06:00",
      "end": "06:00",
      "expected": {
        "overnight": true,
        "total": 375,
        "totals": {
          "sfDay": 0,
          "sfNight": 375,
          "wtDay": 0,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-007",
      "kind": "calculation",
      "start": "23:45",
      "title": "Sonntag 23:45–Montag 06:00"
    },
    {
      "date": "2026-07-20",
      "description": "Montag 00:00–07:00",
      "end": "07:00",
      "expected": {
        "overnight": false,
        "total": 420,
        "totals": {
          "sfDay": 0,
          "sfNight": 0,
          "wtDay": 60,
          "wtNight": 360
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-008",
      "kind": "calculation",
      "start": "00:00",
      "title": "Montag 00:00–07:00"
    },
    {
      "date": "2026-07-18",
      "description": "Samstag 16:00–Sonntag 07:00",
      "end": "07:00",
      "expected": {
        "overnight": true,
        "total": 900,
        "totals": {
          "sfDay": 240,
          "sfNight": 600,
          "wtDay": 60,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-009",
      "kind": "calculation",
      "start": "16:00",
      "title": "Samstag 16:00–Sonntag 07:00"
    },
    {
      "date": "2026-07-17",
      "description": "Freitag 22:00–Samstag 06:00",
      "end": "06:00",
      "expected": {
        "overnight": true,
        "total": 480,
        "totals": {
          "sfDay": 0,
          "sfNight": 0,
          "wtDay": 0,
          "wtNight": 480
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-010",
      "kind": "calculation",
      "start": "22:00",
      "title": "Freitag 22:00–Samstag 06:00"
    },
    {
      "date": "2026-07-14",
      "description": "Feiertag 18:00–07:00",
      "end": "07:00",
      "expected": {
        "overnight": true,
        "total": 780,
        "totals": {
          "sfDay": 180,
          "sfNight": 600,
          "wtDay": 0,
          "wtNight": 0
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": true,
      "id": "TC-011",
      "kind": "calculation",
      "start": "18:00",
      "title": "Feiertag 18:00–07:00"
    },
    {
      "date": "2026-07-14",
      "description": "Dienstag 18:30–Mittwoch 07:15",
      "end": "07:15",
      "expected": {
        "overnight": true,
        "total": 765,
        "totals": {
          "sfDay": 0,
          "sfNight": 0,
          "wtDay": 165,
          "wtNight": 600
        },
        "valid": true
      },
      "group": "Fachtests",
      "holiday": false,
      "id": "TC-012",
      "kind": "calculation",
      "start": "18:30",
      "title": "Dienstag 18:30–Mittwoch 07:15"
    },
    {
      "description": "06:00–06:00",
      "expected": {
        "error": "Beginn und Ende dürfen nicht identisch sein.",
        "segments": {
          "$type": "undefined"
        },
        "valid": false
      },
      "group": "Fachtests",
      "id": "TC-013",
      "kind": "invalid-input",
      "scenarios": [
        {
          "endHour": 6,
          "startHour": 6
        }
      ],
      "title": "Identische Zeiten werden abgelehnt"
    }
  ]
}
```
