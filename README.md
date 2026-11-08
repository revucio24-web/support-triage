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

- **Kategorie** aus 14 Feldern der Verwaltungs-IT (AS/400 & Terminalzugang, Fachverfahren,
  Konto & Anmeldung, Berechtigungen, Drucken & Scannen, E-Mail/Teams, Arbeitsplatz & Hardware,
  Software, Sicherheit & Datenschutz, Telefonie, Daten & Wiederherstellung, Netzwerk,
  Citrix & mobiles Arbeiten, Bürgerterminal & Kiosk)
- **Nicht zugeordnet** statt geraten — passt keine Kategorie, wird das offen gesagt und
  zur Präzisierung der Meldung aufgefordert
- **Priorität** P1–P4 mit Ziel-Reaktionszeit und nachvollziehbarer Begründung; unklare
  Meldungen bleiben ausdrücklich „unbewertet“ statt eine Priorität zu erfinden
- **Typ** Incident oder Service Request aus der Formulierung — unabhängig von der
  Priorität: eine dringende Anforderung bleibt eine Anforderung
- **OTRS-Abbildung** — P1–P4 wird auf die OTRS-Prioritäten 5 very high / 4 high / 3 normal /
  2 low abgebildet, inklusive Queue-Vorschlag je Kategorie
- **Erkennungssignale** — welche Begriffe die Einordnung ausgelöst haben
- **Lösungsschritte** je Kategorie
- **Rückmeldung** als Textentwurf mit Vorgangsnummer und Namensplatzhalter — ohne
  behauptete, noch nicht ausgeführte Handlungen
- **Weitergabe** — wann an Host-Betreuung, Verfahrenshersteller, IT-Sicherheit oder Datenschutz
- **Übergabe-Datensatz** in der Feldstruktur von OTRS (Title, Queue, Type, Priority, State,
  CustomerUser, Artikel und interne Notiz)

## Vorgangsverwaltung

- Vorgangsnummer (INC-… für Störungen, SR-… für Anforderungen)
- Mehrere Tabs: Nummernvergabe **und alle Änderungen** (Status, OTRS-Nummer, Löschen,
  Wiederherstellen, Import) laufen über eine tabübergreifende Sperre (Web Locks, Fallback
  mit Ablaufzeit). Der Bestand wird dabei neu eingelesen statt überschrieben; doppelte
  Nummern werden erkannt und umnummeriert, unbekannte Vorgänge sauber abgewiesen.
- Ziel-Reaktionszeit mit Restzeit-Anzeige
- Suche über Vorgangsnummer, Stichwort und OTRS-Nummer; Filter nach Status und Priorität
- Detailansicht je Vorgang mit Meldung, Lösungsschritten, Rückmeldung und Weitergabe
- Status offen/erledigt, Papierkorb mit Wiederherstellen
- Auswertung nach Kategorie und Priorität
- Kanal der Meldung (Telefon, E-Mail, Persönlich, Selbstbedienung) wandert in den
  OTRS-Datensatz
- OTRS-Ticketnummer kann nach dem Anlegen am Vorgang nachgetragen werden
- Sicherung als JSON-Datei (Export und Import), alles lokal (localStorage)

## Sicherung und Löschen

- **Sicherung** über „Liste sichern (JSON)“ und „Sicherung laden“: eine Datei mit Vorgängen
  und Papierkorb, die sich auf einem anderen Gerät wieder einlesen lässt. Der Import ergänzt
  nur neue Vorgänge; doppelte werden übersprungen.
- **Papierkorb**: Löschen verschiebt Vorgänge zunächst dorthin, sie lassen sich
  wiederherstellen. Erst „Papierkorb endgültig leeren“ entfernt sie unwiderruflich.
- **Datenhaltung**: alles im `localStorage` des Browsers. Wird das Browserprofil gelöscht,
  sind die Vorgänge weg — daher regelmäßig sichern.
- **Datenschutz**: Vorgangstexte und Sicherungsdateien enthalten personenbezogene Daten im
  Klartext. Sicherungsdateien entsprechend aufbewahren und löschen; auf gemeinsam genutzten
  Terminals (Citrix) nach der Arbeit Liste bzw. Papierkorb endgültig leeren.

## Wie die Einordnung funktioniert

Regelbasierte Engine — transparent, ohne Netz:

1. **Kategorie** über gewichtete Schlüsselwörter. Kurze Begriffe (≤ 4 Zeichen) werden nur
   als eigenes Wort geprüft; längere als Wortstamm, damit Komposita wie `Bürgertermin`
   erkannt werden. Ohne Treffer lautet die Kategorie `Nicht zugeordnet` — geraten wird nicht.
2. **Priorität** über Stufenregeln. Ausfall- und Sicherheitssignale ergeben P1,
   Leitungsebene/Gremien/Fristen P2, Wünsche ohne Zeitdruck P4. Ein erkannter Vorgang ohne
   solches Signal bleibt Standardfall P3; eine insgesamt unklare Meldung bleibt unbewertet.
3. **Negation** nur bei Prioritätssignalen: „keinen Termin“ ist kein Termindruck. Die Prüfung
   endet an der Satzgrenze. Auf die Kategorie wird sie bewusst nicht angewendet — „kann mich
   nicht anmelden“ ist ein Anmeldeproblem. `Terminal` wird bei der Priorität nicht als
   `Termin` gelesen.
4. **Konfidenz** aus Trefferstärke und Abstand zur zweitbesten Kategorie; ohne Treffer
   wird sie als „—“ ausgegeben statt als Zahl.
5. **Typ** aus Absichtssignalen: „brauche“, „beantragen“, „freigeben“ sprechen für eine
   Anforderung, „funktioniert nicht“, „defekt“, „gesperrt“ für eine Störung; bei
   Gleichstand entscheidet die Kategorie.

## Barrierefreiheit

Orientierung an den Anforderungen der BITV: Sprungmarke zum Inhalt, semantische Struktur,
ARIA-Rollen für die Bereiche, sichtbarer Fokusrahmen, Tastaturbedienung,
`prefers-reduced-motion` wird respektiert.

## Tests

Die Einordnung ist als Matrix abgesichert, damit Änderungen an der Wissensbasis nicht
unbemerkt Fehleinschätzungen erzeugen:

```
node test/triage-test.mjs
```

Der Test liest die Engine direkt aus `index.html` (keine Kopie) und prüft 37 Einordnungen,
die Typ-Erkennung, die Nummernvergabe, die Offline-Garantie, eindeutige Schlüsselwörter,
die OTRS-Übergabe, die Antwortentwürfe sowie Filter, Import-Zusammenführung und die
Erkennung von Speicherfehlern, Zeitformate, Suche, Import-Normalisierung, Mehr-Tab-Kollisionen sowie alle Schreibpfade unter Sperre.
Node.js wird nur für die Tests benötigt, nicht für die Anwendung.

## Nutzung

`index.html` im Browser öffnen. Kein Build, keine Installation.

## Lizenz

MIT-Lizenz — siehe `LICENSE`. Vor einer Weitergabe im Behördeneinsatz die Lizenz
mit der zuständigen Stelle abstimmen (Alternative z. B. EUPL-1.2).
