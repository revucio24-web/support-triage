# Vorgangs-Triage

Ersteinschätzung für IT-Vorgänge in der Kommunalverwaltung — Kategorie, Priorität,
Lösung und Übergabe-Datensatz in Sekunden.

Eine einzelne HTML-Datei, die **vollständig offline** im Browser läuft: kein Server, keine
externen Aufrufe, keine Protokollierung. Eingaben bleiben auf dem Gerät.

## Warum offline

Ticketinhalte enthalten regelmäßig personenbezogene Daten. Ein Werkzeug, das Freitext an
einen externen Dienst schickt, ist im Behörden­einsatz nicht ohne Weiteres vertretbar.
Diese Anwendung überträgt nichts — die gesamte Auswertung läuft lokal im Browser.

## Was es macht

Freitext rein, und heraus kommt:

- **Kategorie** aus 12 Feldern der Verwaltungs-IT (AS/400 & Terminalzugang, Fachverfahren,
  Konto & Anmeldung, Berechtigungen, Drucken & Scannen, E-Mail, Arbeitsplatz & Hardware,
  Software, Sicherheit & Datenschutz, Telefonie, Daten & Wiederherstellung, Netzwerk)
- **Priorität** P1–P4 mit Ziel-Reaktionszeit und nachvollziehbarer Begründung
- **OTRS-Abbildung** — P1–P4 wird auf die OTRS-Prioritäten 5 very high / 4 high / 3 normal /
  2 low abgebildet, inklusive Queue-Vorschlag je Kategorie
- **Erkennungssignale** — welche Begriffe die Einordnung ausgelöst haben
- **Lösungsschritte** je Kategorie
- **Rückmeldung** als fertiger Textentwurf
- **Weitergabe** — wann an Host-Betreuung, Verfahrenshersteller, IT-Sicherheit oder Datenschutz
- **Übergabe-Datensatz** in der Feldstruktur von OTRS (Title, Queue, Type, Priority, State,
  CustomerUser, Artikel und interne Notiz)

## Vorgangsverwaltung

- Vorgangsnummer (INC-… für Störungen, SR-… für Anforderungen)
- Ziel-Reaktionszeit mit Restzeit-Anzeige
- Liste der erfassten Vorgänge, Status offen/erledigt, Löschen
- Auswertung nach Kategorie und Priorität
- Alles lokal (localStorage), nichts verlässt das Gerät

## Wie die Einordnung funktioniert

Regelbasierte Engine — transparent, ohne Netz:

1. **Kategorie** über gewichtete Schlüsselwörter. Kurze Begriffe (≤ 4 Zeichen) werden nur
   als eigenes Wort geprüft, damit z. B. `lan` nicht in `langsam` trifft.
2. **Priorität** über Stufenregeln. Ausfall- und Sicherheitssignale ergeben P1,
   Leitungsebene/Gremien/Fristen P2, Wünsche ohne Zeitdruck P4.
3. **Negation** nur bei Prioritätssignalen: „keinen Termin“ ist kein Termindruck. Die Prüfung
   endet an der Satzgrenze. Auf die Kategorie wird sie bewusst nicht angewendet — „kann mich
   nicht anmelden“ ist ein Anmeldeproblem.
4. **Konfidenz** aus Trefferstärke und Abstand zur zweitbesten Kategorie.

## Barrierefreiheit

Orientierung an den Anforderungen der BITV: Sprungmarke zum Inhalt, semantische Struktur,
ARIA-Rollen für die Bereiche, sichtbarer Fokusrahmen, Tastaturbedienung,
`prefers-reduced-motion` wird respektiert.

## Nutzung

`index.html` im Browser öffnen. Kein Build, keine Installation.
