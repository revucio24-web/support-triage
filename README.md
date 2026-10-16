# TriageDesk

Ticket-Triage für den IT-Support — Kategorie, Priorität, Lösung und Antwortentwurf in Sekunden.

Eine einzelne HTML-Datei, die **vollständig offline** im Browser läuft: keine Server, keine
Abhängigkeiten, keine externen Requests. Gedacht für den mobilen Einsatz.

## Was es macht

Ein Problem wird als Freitext eingegeben (oder über ein Beispiel ausgewählt). Die App liefert:

- **Kategorie** — aus 10 typischen IT-Support-Feldern (Netzwerk, Drucken, Konto, E-Mail,
  Hardware, Software, Berechtigungen, Sicherheit, Telefonie, Daten/Backup)
- **Priorität** (P1–P4) mit SLA und nachvollziehbarer Begründung
- **Erkennungssignale** — welche Begriffe die Einordnung ausgelöst haben
- **Lösungsschritte** — konkrete Handlungsanweisung je Kategorie
- **Antwortentwurf** — fertiger Text für die Rückmeldung an den Nutzer
- **Eskalation** — wann an 2nd Level, Security oder den Dienstleister übergeben wird
- **Ticket-Typ** — Incident (Störung) oder Service Request (Anforderung), ITIL-nah

## Wie die Einordnung funktioniert

Regelbasierte Engine, transparent und ohne Netz:

1. **Kategorie-Erkennung** — gewichtete Schlüsselwörter je Kategorie. Kurze Begriffe
   werden nur als eigenes Wort geprüft, damit z. B. `lan` nicht in `langsam` trifft.
2. **Priorisierung** — Stufenregeln von kritisch bis niedrig. Ausfall- und
   Sicherheitssignale (`verschlüsselt`, `mehrere`, `Kollegen`) ergeben P1,
   geschäftskritischer Kontext (`Kundentermin`, `Frist`) P2, Wünsche ohne Zeitdruck P4.
3. **Konfidenz** — ergibt sich aus Trefferstärke und Abstand zur zweitbesten Kategorie.
   Ohne klares Prioritätssignal sinkt sie.
4. **Negations-Erkennung** — bei den Prioritätssignalen zählt eine Verneinung unmittelbar
   vor dem Signalwort: „keinen **Termin**" oder „nicht **dringend**" lösen keine hohe
   Priorität aus. Die Prüfung endet an der Satzgrenze, damit das „nicht" aus
   „Seiten laden **nicht**. Kollegen sind betroffen." nicht die Kollegen verneint.
   Auf die Kategorie-Erkennung wird sie bewusst **nicht** angewendet: „ich kann mich nicht
   anmelden" beschreibt ein Anmelde-Problem — die Verneinung gehört dort zum Symptom.

## Warum regelbasiert statt KI-API

Im mobilen Einsatz ist ein Dienst ohne Netzabhängigkeit zuverlässiger als ein Modellaufruf:
sofortige Antwort, keine Latenz, keine Kosten, keine Datenweitergabe. Die Fachlogik ist
zusätzlich nachvollziehbar — jede Einordnung lässt sich begründen.

## Nutzung

`index.html` im Browser öffnen. Kein Build, keine Installation.
