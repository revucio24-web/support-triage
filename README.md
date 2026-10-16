# Vorgangs-Triage

Ersteinschaetzung fuer IT-Vorgaenge in der Kommunalverwaltung — Kategorie, Prioritaet,
Loesung und Uebergabe-Datensatz in Sekunden.

Eine einzelne HTML-Datei, die **vollstaendig offline** im Browser laeuft: kein Server, keine
externen Aufrufe, keine Protokollierung. Eingaben bleiben auf dem Geraet.

## Warum offline

Ticketinhalte enthalten regelmaessig personenbezogene Daten. Ein Werkzeug, das Freitext an
einen externen Dienst schickt, ist im Behordeneinsatz nicht ohne Weiteres vertretbar.
Diese Anwendung uebertraegt nichts — die gesamte Auswertung laeuft lokal im Browser.

## Was es macht

Freitext rein, und heraus kommt:

- **Kategorie** aus 12 Feldern der Verwaltungs-IT (AS/400 & Terminalzugang, Fachverfahren,
  Konto & Anmeldung, Berechtigungen, Drucken & Scannen, E-Mail, Arbeitsplatz & Hardware,
  Software, Sicherheit & Datenschutz, Telefonie, Daten & Wiederherstellung, Netzwerk)
- **Prioritaet** P1-P4 mit Ziel-Reaktionszeit und nachvollziehbarer Begruendung
- **OTRS-Abbildung** — P1..P4 wird auf die OTRS-Prioritaeten 5 very high / 4 high / 3 normal / 2 low abgebildet
- **Erkennungssignale** — welche Begriffe die Einordnung ausgeloest haben
- **Loesungsschritte** je Kategorie
- **Rueckmeldung** als fertiger Textentwurf
- **Weitergabe** — wann an Host-Betreuung, Verfahrenshersteller, IT-Sicherheit oder Datenschutz
- **Uebergabe-Datensatz** in der Feldstruktur von OTRS (Title, Queue, Type, Priority, State,
  Artikel, interne Notiz)

## Vorgangsverwaltung

- Vorgangsnummer (INC-… fuer Stoerungen, SR-… fuer Anforderungen)
- Ziel-Reaktionszeit mit Restzeit-Anzeige
- Liste der erfassten Vorgaenge, Status offen/erledigt, Loeschen
- Auswertung nach Kategorie und Prioritaet
- Alles lokal (localStorage), nichts verlaesst das Geraet

## Wie die Einordnung funktioniert

Regelbasierte Engine — transparent, ohne Netz:

1. **Kategorie** ueber gewichtete Schluesselwoerter. Kurze Begriffe (<= 4 Zeichen) werden nur
   als eigenes Wort geprueft, damit z. B. `lan` nicht in `langsam` trifft.
2. **Prioritaet** ueber Stufenregeln. Ausfall- und Sicherheitssignale ergeben P1,
   Leitungsebene/Gremien/Fristen P2, Wuensche ohne Zeitdruck P4.
3. **Negation** nur bei Prioritaetssignalen: „keinen Termin" ist kein Termindruck. Die Pruefung
   endet an der Satzgrenze. Auf die Kategorie wird sie bewusst nicht angewendet — „kann mich
   nicht anmelden" ist ein Anmeldeproblem.
4. **Konfidenz** aus Trefferstaerke und Abstand zur zweitbesten Kategorie.

## Barrierefreiheit

Orientierung an den Anforderungen der BITV: Sprungmarke zum Inhalt, semantische Struktur,
ARIA-Rollen fuer die Bereiche, sichtbarer Fokusrahmen, Tastaturbedienung,
`prefers-reduced-motion` wird respektiert.

## Nutzung

`index.html` im Browser oeffnen. Kein Build, keine Installation.
