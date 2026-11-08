# Betriebsanleitung (Kurzfassung)

Stand: November 2026 · Version 1.0.0

Diese Anwendung ist eine **Ersteinschätzung** für IT-Vorgänge: Kategorie, Priorität,
Typ, Lösungsschritte, Antwortentwurf und OTRS-Übergabe. Sie ersetzt kein Ticketsystem
und hat keine OTRS-Anbindung — die Übergabe erfolgt als Text zum Kopieren.

## 1. Start

- `index.html` im Browser öffnen (Doppelklick) oder die gehostete Fassung nutzen:
  <https://revucio24-web.github.io/support-triage/>
- Aktuelles Edge, Chrome oder Firefox; keine Installation, kein Build.
- Alle Eingaben bleiben im Browserprofil (`localStorage`); es werden keine Daten
  übertragen. Auch die gehostete Fassung arbeitet rein lokal.

## 2. Täglicher Ablauf

1. **Erfassung**: Meldung als Freitext einfügen, „Einschätzen“.
2. **Prüfen**: Kategorie, Priorität, Trefferqualität und „Warum diese Priorität“ lesen.
   Bei „Nicht zugeordnet“ oder „unbewertet“ zuerst die Meldung präzisieren.
3. **Arbeiten**: Lösungsschritte abarbeiten, Antwortentwurf anpassen (Name, Bezug).
4. **Ablegen**: Kanal wählen, „In Vorgangsliste übernehmen“.
5. **Übergabe**: „OTRS-Übergabe erzeugen“, in OTRS einfügen, danach die
   OTRS-Ticketnummer am Vorgang nachtragen (Liste oder Detailansicht).

## 3. Sicherung

- Regelmäßig (mindestens wöchentlich, bei viel Betrieb täglich) **„Liste sichern (JSON)“**.
- Sicherungsdatei getrennt ablegen (z. B. verschlüsseltes Laufwerk), nicht im
  Download-Ordner lassen.
- **Import ergänzt nur** neue Vorgänge, er überschreibt nichts; doppelte werden übersprungen.
- Sicherung nach jedem größeren Update einmal testweise in ein zweites Browserprofil
  laden — nur so ist die Wiederherstellung erprobt.

## 4. Löschen und Aufbewahrung

- „löschen“ verschiebt in den **Papierkorb**; dort wiederherstellbar.
- „Papierkorb endgültig leeren“ entfernt unwiderruflich.
- Wird das Browserprofil gelöscht (auch durch Aufräumtools), sind die Vorgänge weg.
  Aufbewahrungsfristen daher organisatorisch festlegen und Sicherungen entsprechend
  löschen.

## 5. Datenschutz

- Vorgangstexte, Antwortentwürfe und **Sicherungsdateien** enthalten personenbezogene
  Daten im Klartext. Zugriff auf Gerät, Browserprofil und Sicherungsordner beschränken.
- Auf gemeinsam genutzten Terminals (Citrix, Wechselplätze) nach der Arbeit Liste bzw.
  Papierkorb endgültig leeren und den Browser schließen.
- In die Zwischenablage kopierte OTRS-Daten können im Windows-Zwischenablageverlauf
  landen — Verlauf ggf. deaktivieren.
- Der Einsatz ist mit dem Datenschutzbeauftragten abzustimmen (Löschkonzept,
  Aufbewahrung, Gerätezugriff).

## 6. OTRS anpassen

- **Queues**: je Kategorie in der Wissensbasis (`queue`).
- **Typen**: `OTRS_TYPEN` auf die Werte der eigenen Queue-Konfiguration abbilden
  (Znuny-Standard häufig `Incident`/`Request`).
- **Prioritäten**: Abbildung auf `5 very high` … `2 low` steht in `PRIO_RULES`.
- Nach Änderungen: `node test/triage-test.mjs` ausführen und einen Testvorgang bis
  OTRS durchspielen.

## 7. Mehrere Tabs und Geräte

- Mehrere Tabs im selben Browserprofil sind unterstützt: Nummernvergabe und alle
  Änderungen sind tabübergreifend gesperrt.
- Unterschiedliche Browser/Profile haben getrennte Speicher — Daten über JSON-Sicherung
  übertragen. Parallele Bearbeitung derselben „Liste“ auf zwei Geräten ist nicht
  vorgesehen.

## 8. Störungen und Abhilfe

| Meldung | Ursache / Abhilfe |
|---|---|
| „Speichern fehlgeschlagen“ | Speicher voll oder gesperrt (Privatmodus?). Sicherung erstellen, alte Vorgänge leeren, Speicherplatz prüfen. |
| „Sicherung konnte nicht gelesen werden“ | Datei beschädigt oder kein JSON. Nur mit „Liste sichern (JSON)“ erzeugte Dateien verwenden. |
| „Vorgang nicht mehr vorhanden“ | In einem anderen Tab gelöscht — Liste neu laden. |
| „Nicht zugeordnet“ / „unbewertet“ | Meldung präzisieren (System, Umfang, Zeitpunkt); keine geratene Einordnung. |
| Seite reagiert nicht wie erwartet | Browser aktualisieren; bei sehr alten Browsern fehlt die Web-Locks-Sperre (Fallback aktiv). |

## 9. Vor dem Echtbetrieb prüfen

- [ ] Browser-Test (alle Tabs, Filter, Detaildialog, Sicherung, Wiederherstellen)
- [ ] Queue-/Typ-/Prioritätswerte gegen die OTRS-Instanz geprüft
- [ ] Inhalte (Lösungsschritte, Antworten, Eskalation) fachlich abgenommen
- [ ] Datenschutz/Löschkonzept mit DSB geklärt
- [ ] Lizenz für die Weitergabe geklärt
- [ ] Sicherung und Wiederherstellung einmal geübt

## 10. Tests

```
node test/triage-test.mjs
```

Node.js wird nur für die Tests benötigt, nicht für die Anwendung.
