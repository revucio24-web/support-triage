# Microsoft Store: Windows-App veröffentlichen

Stand: November 2026 · App-Version 1.0.0

Diese Anwendung ist als **PWA** (installierbare Web-App) vollständig vorbereitet und kann
über den offiziellen Weg als Windows-App im Microsoft Store veröffentlicht werden. Die
Verpackung als MSIX übernimmt **PWA Builder**; die Veröffentlichung läuft über **Partner
Center**. Für beides ist ein Microsoft-Konto der einsetzenden Stelle nötig — das kann die
Anwendung nicht übernehmen.

## Was bereits fertig ist

| Baustein | Datei / URL |
|---|---|
| Installierbare PWA (Manifest, Icons, Standalone) | `manifest.webmanifest`, `icons/` |
| Offline-Betrieb nach dem ersten Laden | `sw.js` |
| Datenschutzerklärung (Pflicht-URL für den Store) | `privacy.html` → <https://revucio24-web.github.io/support-triage/privacy.html> |
| Live-Adresse | <https://revucio24-web.github.io/support-triage/> |
| Store-Icon 300×300 / 1024×1024 | `store/icon-300.png`, `store/icon-1024.png` |
| Betriebsanleitung, Lizenz, Tests | `BETRIEB.md`, `LICENSE`, `test/triage-test.mjs` |

## Schritt 1: Partner-Center-Konto

1. Persönliches Microsoft-Konto anlegen bzw. nutzen (kein Schul-/Arbeitskonto).
2. Im **Windows Developer Program** anmelden: <https://partner.microsoft.com/dashboard>
   → „Apps and games“.
3. Kontoart wählen:
   - **Unternehmen/Organisation** (für eine Behörde üblich) — Verifizierung erforderlich,
     ggf. kostenlos; Angaben zur Organisation bereithalten.
   - **Einzelperson** — einmalige Registrierungsgebühr (aktuell ca. 19 USD; Konditionen
     vor der Anmeldung prüfen).
4. Steuer- und Auszahlungsdaten sind nur nötig, wenn die App kostenpflichtig wird —
   diese App ist **kostenlos**.

## Schritt 2: App reservieren (Identity holen)

1. Partner Center → **Apps and games** → **New product** → **MSIX or PWA app**.
2. Namen reservieren: **Vorgangs-Triage** (alternativ z. B. „Vorgangs-Triage IT-Support“).
3. Unter **Product identity** die Werte kopieren — sie werden für das Paket gebraucht:
   - **Package/Identity/Name** (z. B. `12345Dienststelle.VorgangsTriage`)
   - **Publisher** (z. B. `CN=ABCDEF12-...`)
   - **Publisher display name**
   - **Package family name**
4. Diese Werte sind später nicht mehr frei änderbar — sorgfältig übernehmen.

## Schritt 3: MSIX mit PWA Builder erzeugen

1. <https://www.pwabuilder.com> öffnen.
2. URL eingeben: `https://revucio24-web.github.io/support-triage/`
3. **Package for stores** → **Windows** → **Generate package**.
4. Die Identity-Werte aus Schritt 2 eintragen (Package ID, Publisher, Publisher display name).
5. Paket herunterladen: `.msix` (für den Store) und ggf. Testzertifikat `.cer`.
6. Optional lokal prüfen: Zertifikat installieren, MSIX per Doppelklick installieren,
   Anwendung starten. Die App muss nach dem ersten Laden auch ohne Netz funktionieren.

> Hinweis: PWA Builder erzeugt einen WebView2-Host, der die PWA lädt. Nach dem ersten
> Start liegen die Dateien im Cache und die App arbeitet offline. Wenn die App **ab dem
> ersten Start ohne Internet** laufen muss, ist ein eigener WebView2-Wrapper mit
> eingebetteten Dateien der bessere Weg — sag Bescheid, dann bereite ich das vor.

## Schritt 4: Store-Eintrag vorbereiten

**Pflichtangaben**

- **App-Name:** Vorgangs-Triage
- **Kategorie:** Business (alternativ Productivity)
- **Preis:** kostenlos, keine In-App-Käufe
- **Datenschutz-URL:** `https://revucio24-web.github.io/support-triage/privacy.html`
- **Support-URL:** `https://github.com/revucio24-web/support-triage`
- **Altersfreigabe:** IARC-Fragebogen — keine Gewalt, keine Inhalte für Erwachsene,
  keine Datenerhebung, keine Werbung, keine Käufe → niedrigste Einstufung.
- **Sprache:** Deutsch; weitere Märkte optional (DE/AT/CH).

**Screenshots** (mind. 1, empfohlen 4–5; Format 1366×768 oder 1920×1080, PNG):

1. Erfassung mit Beispieltext und Ergebnis (Kategorie/Priorität)
2. Lösungsschritte und Antwortentwurf
3. Vorgangsliste mit Suche/Filter
4. Detailansicht
5. Sicherung/Papierkorb

Aufnahme: Anwendung im Browser öffnen, Fenster auf 1366×768 bringen, Screenshot speichern
unter `store/screenshot-1.png` usw. Keine echten Personendaten verwenden — Beispieldaten
aus den Chips nutzen.

**Beschreibung (Vorschlag)**

> Ersteinschätzung für IT-Vorgänge: Kategorie, Priorität, Typ, Lösungsschritte,
> Antwortentwurf und OTRS-Übergabe in Sekunden. Die Anwendung arbeitet vollständig
> offline, überträgt keine Daten und speichert alles lokal auf dem Gerät.
>
> Für den IT-Support in Kommunalverwaltungen: 14 typische Kategorien von AS/400 über
> Fachverfahren und Citrix bis Bürgerterminal, nachvollziehbare Priorisierung,
> Textentwürfe ohne voreilige Zusagen sowie eine Vorgangsverwaltung mit Suche,
> Papierkorb und JSON-Sicherung. Personenbezogene Ticketinhalte verlassen das Gerät
> nicht — ideal für den Behörden­einsatz.

**Stichworte:** IT-Support, Ticketsystem, Triage, Verwaltung, OTRS, Helpdesk, offline

## Schritt 5: Einreichen und Zertifizierung

1. Paket in Partner Center hochladen (oder PWA Builder direkt mit Partner Center
   verbinden, falls angeboten).
2. Alle Pflichtfelder ausfüllen, Screenshots und Beschreibung ergänzen.
3. **Notes for certification** (wichtig): „Die App arbeitet offline, benötigt keine
   Anmeldung und überträgt keine Daten. Beispieldaten sind über die Chips auf der
   Startseite verfügbar. Bitte die App nach dem ersten Start ohne Netz testen.“
4. Einreichen. Die Prüfung dauert typischerweise 1–3 Werktage.
5. Häufige Ablehnungsgründe: fehlende Datenschutz-URL, irreführende Screenshots,
   Funktion nur mit Konto/Netz, nicht getestete Offline-Funktion.

## Schritt 6: Updates

1. Änderungen am Code committen und pushen (Pages baut automatisch neu).
2. Bei Bedarf `sw.js`: `CACHE`-Version erhöhen (z. B. `v1.0.1`).
3. Neues MSIX mit erhöhter Versionsnummer über PWA Builder erzeugen und in Partner
   Center als Update einreichen.

## Offline-Verhalten (wichtig für die Zertifizierung)

- Nach dem ersten erfolgreichen Laden liegen App-Hülle und Icons im Service-Worker-Cache.
- Danach funktioniert die Anwendung ohne Netz; Eingaben bleiben im lokalen Speicher.
- Der erste Start im Store-Kontext benötigt eine Verbindung (Installation/Update).

## Checkliste

- [ ] Partner-Center-Konto vorhanden (Unternehmen oder Einzelperson)
- [ ] App-Name reserviert, Identity-Werte kopiert
- [ ] MSIX über PWA Builder erzeugt und lokal installiert/getestet
- [ ] Offline-Test nach dem ersten Start
- [ ] Screenshots (1366×768/1920×1080) ohne echte Personendaten
- [ ] Datenschutz-URL und Support-URL eingetragen
- [ ] Altersfreigabe-Fragebogen ausgefüllt
- [ ] Notes for certification ergänzt
- [ ] Einreichung und Freigabe
