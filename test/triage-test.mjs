#!/usr/bin/env node
/* Regressions-Tests für die Triage-Engine in index.html.
   Aufruf:  node test/triage-test.mjs
   Die Engine wird direkt aus index.html gelesen - keine Kopie, kein Build. */

import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");

function abschnitt(von, bis) {
  const s = html.indexOf(von);
  const e = html.indexOf(bis);
  if (s < 0 || e < 0 || e <= s) {
    console.error("Marker nicht gefunden: " + von + " / " + bis);
    process.exit(2);
  }
  return html.slice(s, e);
}

const engineQuelle =
  abschnitt("const KB = [", "/* ---------- 6. Darstellung") + "\n" +
  abschnitt("function otrsDatensatz(v){", "function tickRest(){") + "\n" +
  "return { analyze, KB, FALLBACK, PRIO_UNBEWERTET, otrsDatensatz, istVorgang, nummerStand, filtereVorgaenge, uebernehmeImport, saveAll, absicht, naechsteId, naechsteNummer, freieNummer, speichereVorgang, repariereKollision, leseZaehler, baueId, restzeit, loadAll, normalisiereVorgang, mitSignatur, qualitaet, otrsTyp, OTRS_TYPEN, aendereVorgang, schalteStatus, loescheVorgang, stelleWiederHer, entferneAusKorb, leereListe, leereKorb, uebernehmeSicherung, findeVorgang };";
const vollerSpeicher = { getItem: () => null, setItem: () => { throw new Error("voll"); } };
const engine = new vm.Script("(function(){\n" + engineQuelle + "\n})()", { filename: "engine" })
  .runInNewContext({ localStorage: vollerSpeicher, toast: () => {} });

const speicherStand = new Map();
const engineMitSpeicher = new vm.Script("(function(){\n" + engineQuelle + "\n})()", { filename: "engine-speicher" })
  .runInNewContext({
    localStorage: {
      getItem: (k) => (speicherStand.has(k) ? speicherStand.get(k) : null),
      setItem: (k, v) => { speicherStand.set(k, String(v)); },
      removeItem: (k) => { speicherStand.delete(k); }
    },
    toast: () => {},
    setTimeout,
  });

let pruefungen = 0;
let fehler = 0;
function pruefe(name, ok, detail) {
  pruefungen++;
  if (!ok) {
    fehler++;
    console.log("FEHLT  " + name + (detail !== undefined ? "  (" + detail + ")" : ""));
  }
}

/* ---------- 1. Einordnung: Kategorie und Priorität ---------- */
const faelle = [
  ["AS/400-Abbruch, mehrere Plätze", "Die AS/400-Sitzung bricht seit heute ständig ab, ich komme nicht an die Faktura-Daten. Zwei Kolleginnen im Sachgebiet haben dasselbe Problem.", "as400", "1"],
  ["Konto gesperrt mit Bürgertermin", "Ich kann mich nicht anmelden, mein Konto ist gesperrt und ich habe in 30 Minuten einen Bürgertermin am Schalter.", "acc", "2"],
  ["Fachverfahren-Fehler", "Das Fachverfahren zeigt beim Oeffnen einer Akte eine Fehlermeldung und lässt sich nicht mehr bedienen.", "fach", "3"],
  ["Phishing-Mail", "Ich habe eine verdächtige Mail bekommen und versehentlich auf den Link geklickt. Der Rechner reagiert jetzt sehr langsam.", "sec", "1"],
  ["Bürgerbüro-Drucker", "Der Drucker am Publikumsschalter druckt keine Formulare mehr, die Warteschlange staut sich und draussen warten Bürger.", "prt", "2"],
  ["Berechtigung", "Ich brauche Zugriff auf den Aktenordner meines Sachgebiets, meine Kollegin hat ihn auch.", "perm", "3"],
  ["Kleinigkeit", "Mein Monitorkabel sitzt etwas locker, es funktioniert aber. Kein Stress, wenn Sie mal Zeit haben.", "hw", "4"],
  ["Terminal startet nicht", "Das Terminal im Meldeamt startet nicht mehr, der Bildschirm bleibt schwarz.", "hw", "3"],
  ["Keine Mails", "Ich bekomme seit heute keine Mails mehr, der Posteingang bleibt leer.", "mail", "3"],
  ["Standort allein", "Ich arbeite am Standort Rathaus und brauche eine neue Tastatur.", "hw", "3"],
  ["Mehrere Fragen", "Ich habe mehrere Fragen zur Softwareinstallation.", "sw", "3"],
  ["Bürostuhl unbekannt", "Ich brauche einen neuen Buerostuhl fuer mein Zimmer.", "unklar", "?"],
  ["Rückruf ohne Details", "Bitte um Rueckruf.", "unklar", "?"],
  ["Termindruck verneint", "Kein Termindruck, aber der Drucker im Buergerbuero ist kaputt.", "prt", "2"],
  ["Nicht dringend", "Das ist nicht dringend, der Monitor flackert nur leicht.", "hw", "4"],
  ["Alle können nicht drucken", "Alle koennen nicht drucken, die Warteschlange steht im ganzen Sachgebiet.", "prt", "1"],
  ["Akten ohne Aktenordner", "Ich brauche Zugriff auf die Akten meines Sachgebiets.", "perm", "3"],
  ["Dringend und heute noch", "Es ist sehr dringend, ich brauche das Passwort heute noch.", "acc", "2"],
  ["VPN fällt aus", "Das VPN baut keine Verbindung mehr auf, ich komme nicht ins Netz.", "net", "3"],
  ["Datei gelöscht", "Ich habe versehentlich eine Datei geloescht und brauche sie zurueck.", "dat", "3"],
  ["Erpressungsmeldung", "Auf dem Rechner erscheint eine Erpressungsmeldung, Dateien sind verschluesselt.", "sec", "1"],
  ["Leere Rückfrage", "Der Vorgang von gestern ist noch offen, gibt es Neuigkeiten?", "unklar", "?"],
  ["Drucken statt Drucker", "Ich kann seit gestern nicht drucken.", "prt", "3"],
  ["Monitor für Abteilung", "Ich brauche einen neuen Monitor fuer die Abteilung.", "hw", "3"],
  ["Toner am Standort", "Der Toner am Standort Rathaus ist leer.", "prt", "3"],
  ["Mehrere Stühle", "Wir haben mehrere Buerostuehle bestellt, wann kommen die?", "unklar", "?"],
  ["Ganzes Amt druckt nicht", "Der Drucker im ganzen Amt druckt nicht mehr.", "prt", "1"],
  ["Maus im Bürgerbüro", "Die Maus im Buergerbuero funktioniert nicht.", "hw", "2"],
  ["Betroffen verneint", "Andere sind nicht betroffen, nur ich habe das Problem.", "unklar", "?"],
  ["Ausfall der Kasse", "Der Ausfall der Kasse blockiert den Publikumsverkehr.", "fach", "1"],
  ["Terminaldrucker", "Der Terminaldrucker an der Kasse druckt nicht.", "prt", "3"],
  ["Citrix-Sitzung bricht ab", "Meine Citrix-Sitzung bricht beim Start ab, ich komme von zuhause nicht an die Fachanwendungen.", "citrix", "3"],
  ["Teams startet nicht", "Teams startet nicht mehr, ich kann keine Besprechungen mehr machen.", "mail", "3"],
  ["OneDrive synchronisiert nicht", "Mein OneDrive synchronisiert nicht mehr, Dateien fehlen.", "mail", "3"],
  ["Zertifikat abgelaufen", "Mein Zertifikat für das VPN ist abgelaufen.", "net", "3"],
  ["Bürgerterminal", "Das Buergerterminal im Foyer startet nicht mehr.", "kiosk", "3"],
  ["M365-Lizenz", "Fuer M365 ist meine Lizenz abgelaufen, ich komme nicht rein.", "mail", "3"],
];

for (const [name, text, kat, prio] of faelle) {
  const a = engine.analyze(text);
  pruefe(name + " / Kategorie", a.cat.id === kat, "erhalten: " + a.cat.id);
  pruefe(name + " / Priorität", String(a.prio.p) === prio, "erhalten: " + a.prio.p);
}

/* ---------- 2. Unklare Meldungen werden nicht geraten ---------- */
const unklar = engine.analyze("Ich brauche einen neuen Buerostuhl fuer mein Zimmer.");
pruefe("unklare Meldung nutzt Fallback", unklar.cat.id === "unklar");
pruefe("unklare Meldung ist als unklar markiert", unklar.unbekannt === true);
pruefe("unklare Meldung ohne Priorität", unklar.prio.p === "?", "erhalten: " + unklar.prio.p);
pruefe("unklare Meldung ohne Konfidenz", unklar.conf === 0, "erhalten: " + unklar.conf);
pruefe("Fallback hat Lösungsschritte", engine.FALLBACK.steps.length >= 5);
pruefe("Fallback nennt keine erledigte Handlung", engine.FALLBACK.reply.indexOf("ich habe") === -1);

/* ---------- 3. Negation und Terminal-Falle ---------- */
const terminal = engine.analyze("Das Terminal im Meldeamt startet nicht mehr, der Bildschirm bleibt schwarz.");
pruefe("Terminal wird nicht als Termin gelesen", String(terminal.prio.p) === "3", "erhalten: " + terminal.prio.p);
const negiert = engine.analyze("Der Drucker ist kaputt, ich habe keinen Termin.");
pruefe("negierter Termin hebt Priorität nicht", String(negiert.prio.p) === "3", "erhalten: " + negiert.prio.p);
const mehrere = engine.analyze("Ich habe mehrere Fragen zur Softwareinstallation.");
pruefe("mehrere allein ist kein P1", String(mehrere.prio.p) === "3", "erhalten: " + mehrere.prio.p);

/* ---------- 4. OTRS-Übergabe ---------- */
const ticket = {
  id: "INC-2026-0001", typ: "Incident", kat: "Drucken & Scannen", queue: "IT-Support / Peripherie",
  otrs: "4 high", prio: 2, prioLabel: "Hoch", ziel: "1 Std", conf: 88, ausloeser: ["bürgerbüro"],
  erfasst: "2026-11-05T10:00:00.000Z", text: "Der Drucker am Publikumsschalter druckt nicht.",
  steps: ["Warteschlange prüfen"], esc: "An den Druckerserver.", reply: "Guten Tag,\n\nText.",
  kanal: "E-Mail", otrsNr: "2026110500123"
};
const datensatz = engine.otrsDatensatz(ticket);
pruefe("OTRS-Datensatz übernimmt den Kanal", datensatz.indexOf("Kanal: E-Mail") !== -1);
pruefe("OTRS-Datensatz enthält die OTRS-Nummer", datensatz.indexOf("2026110500123") !== -1);
pruefe("OTRS-Datensatz mappt die Priorität", datensatz.indexOf("Priority:     4 high") !== -1);
pruefe("OTRS-Datensatz hat keinen festen Kanal Telefon", datensatz.indexOf("Kanal: Telefon") === -1);
const offen = engine.otrsDatensatz(Object.assign({}, ticket, { prio: "?", otrs: "3 normal" }));
pruefe("unbewerteter Vorgang ist im Datensatz markiert", offen.indexOf("unbewertet") !== -1);

/* ---------- 4b. Filter, Import und Speicherfehler ---------- */
const tA = { id: "INC-2026-0007", kat: "Drucken & Scannen", text: "Drucker defekt", prio: 2, prioLabel: "Hoch", status: "offen", erfasst: "2026-11-01T08:00:00.000Z", otrsNr: "2026110100007" };
const tB = { id: "SR-2025-0012", kat: "Berechtigungen & Freigaben", text: "Zugriff auf Laufwerk", prio: 3, prioLabel: "Mittel", status: "erledigt", erfasst: "2026-10-01T08:00:00.000Z" };
pruefe("gültiger Vorgang erkannt", engine.istVorgang(tA) === true);
pruefe("leerer Vorgang abgelehnt", engine.istVorgang(null) === false);
pruefe("Vorgang ohne Kategorie abgelehnt", engine.istVorgang({ id: "X", text: "x", erfasst: "2026-01-01T00:00:00.000Z" }) === false);
pruefe("Vorgang mit ungültigem Datum abgelehnt", engine.istVorgang({ id: "X", kat: "Y", text: "z", erfasst: "kein datum" }) === false);
pruefe("höchste Vorgangsnummer ermittelt", engine.nummerStand([tA, tB]) === 12);
pruefe("Filter nach Text", engine.filtereVorgaenge([tA, tB], { text: "drucker" }).length === 1);
pruefe("Filter nach Status", engine.filtereVorgaenge([tA, tB], { status: "erledigt" }).length === 1);
pruefe("Filter nach Priorität", engine.filtereVorgaenge([tA, tB], { prio: "2" }).length === 1);
pruefe("Filter nach OTRS-Nummer", engine.filtereVorgaenge([tA, tB], { text: "2026110100007" }).length === 1);
const importiert = engine.uebernehmeImport([tA], [], [tA, tB, null], []);
pruefe("Import übernimmt nur Neues", importiert.uebernommen === 1);
pruefe("Import erkennt Doppeltes", importiert.doppelt === 1);
pruefe("Import erhält den Bestand", importiert.liste.length === 2);
pruefe("Import meldet den Nummernstand", importiert.stand === 12);
const importDoppelt = engine.uebernehmeImport([], [], [tA, tA], []);
pruefe("Import entdoppelt innerhalb der Datei", importDoppelt.uebernommen === 1 && importDoppelt.doppelt === 1);
const importKorb = engine.uebernehmeImport([], [{ id: "INC-2026-0003", kat: "X", text: "y", erfasst: "2026-01-01T00:00:00.000Z" }], [], [{ id: "INC-2026-0009", kat: "X", text: "z", erfasst: "2026-01-01T00:00:00.000Z" }]);
pruefe("Import ergänzt den Papierkorb", importKorb.korbUebernommen === 1 && importKorb.korb.length === 2);
pruefe("Speicherfehler wird erkannt", engine.saveAll([]) === false);

/* ---------- 4c. Typ aus der Absicht, Nummernvergabe ---------- */
const typFaelle = [
  ["Kabel locker ist eine Störung", "Mein Monitorkabel sitzt etwas locker, es funktioniert aber. Kein Stress, wenn Sie mal Zeit haben.", "Incident"],
  ["Zugriff ist eine Anforderung", "Ich brauche Zugriff auf den Aktenordner meines Sachgebiets, meine Kollegin hat ihn auch.", "Service Request"],
  ["Fragen sind eine Anforderung", "Ich habe mehrere Fragen zur Softwareinstallation.", "Service Request"],
  ["Neuer Monitor ist eine Anforderung", "Ich brauche einen neuen Monitor fuer die Abteilung.", "Service Request"],
  ["Abbruch ist eine Störung", "Die AS/400-Sitzung bricht seit heute ständig ab.", "Incident"],
  ["Rückruf ist eine Anforderung", "Bitte um Rueckruf.", "Service Request"]
];
for (const [name, text, typ] of typFaelle) {
  pruefe(name, engine.analyze(text).type === typ, "erhalten: " + engine.analyze(text).type);
}
const dringendeAnfrage = engine.analyze("Es ist dringend, ich brauche einen neuen Laptop sofort.");
pruefe("dringende Anfrage bleibt Anfrage", dringendeAnfrage.prio.p === 2 && dringendeAnfrage.type === "Service Request", dringendeAnfrage.type + " / P" + dringendeAnfrage.prio.p);
const entspannteAnfrage = engine.analyze("Ich brauche einen neuen Buerostuhl, kein Stress.");
pruefe("entspannte Anfrage bleibt Anfrage", entspannteAnfrage.prio.p === 4 && entspannteAnfrage.type === "Service Request", entspannteAnfrage.type + " / P" + entspannteAnfrage.prio.p);

const jahr = new Date().getFullYear();
const vorschau1 = engineMitSpeicher.naechsteId("Incident");
const vorschau2 = engineMitSpeicher.naechsteId("Incident");
pruefe("Vorschau verbraucht keine Nummer", vorschau1 === vorschau2, vorschau1 + " / " + vorschau2);
pruefe("Vorschau-Nummer ist die nächste", vorschau1 === "INC-" + jahr + "-0001", vorschau1);
pruefe("Vorschau schreibt keinen Zähler", !speicherStand.has("vorgangstriage.zaehler"));

const basis = { typ: "Incident", kat: "Drucken & Scannen", text: "Drucker defekt", erfasst: "2026-11-02T09:00:00.000Z", replyBasis: "Guten Tag," };
const gespeichert1 = await engineMitSpeicher.speichereVorgang(basis);
pruefe("Ablegen liefert ok", gespeichert1.ok === true);
pruefe("Ablegen vergibt die Vorschau-Nummer", gespeichert1.vorgang.id === vorschau1, gespeichert1.vorgang.id);
pruefe("Antwort enthält die Vorgangsnummer", gespeichert1.vorgang.reply.indexOf("Vorgangsnummer: " + gespeichert1.vorgang.id) !== -1);
pruefe("Zähler nach dem Ablegen", speicherStand.get("vorgangstriage.zaehler") === "1", String(speicherStand.get("vorgangstriage.zaehler")));
const nach1 = JSON.parse(speicherStand.get("vorgangstriage.vorgaenge"));
pruefe("Vorgang liegt in der Liste", nach1.length === 1 && nach1[0].id === vorschau1);

const gespeichert2 = await engineMitSpeicher.speichereVorgang(Object.assign({}, basis, { typ: "Service Request" }));
pruefe("zweite Nummer fortlaufend", gespeichert2.vorgang.id === "SR-" + jahr + "-0002", gespeichert2.vorgang.id);
pruefe("Speichern führt zusammen statt zu überschreiben", JSON.parse(speicherStand.get("vorgangstriage.vorgaenge")).length === 2);

/* Kollisionsreparatur: zwei Einträge mit gleicher Nummer, Verlierer wird umnummeriert */
const kollision = [
  { id: "INC-" + jahr + "-0009", token: "b", typ: "Incident", replyBasis: "X" },
  { id: "INC-" + jahr + "-0009", token: "a", typ: "Incident", replyBasis: "Y" }
];
speicherStand.set("vorgangstriage.vorgaenge", JSON.stringify(kollision));
speicherStand.set("vorgangstriage.zaehler", "8");
const repariert = await engineMitSpeicher.repariereKollision({ ok: true, vorgang: kollision[0] });
const reparierteListe = JSON.parse(speicherStand.get("vorgangstriage.vorgaenge"));
const reparierteIds = reparierteListe.map(v => v.id);
pruefe("Kollision wird aufgelöst", reparierteIds.length === 2 && reparierteIds[0] !== reparierteIds[1], JSON.stringify(reparierteIds));
pruefe("Gewinner behält die Nummer", reparierteListe.find(v => v.token === "a").id === "INC-" + jahr + "-0009");
pruefe("Verlierer wird umnummeriert", reparierteListe.find(v => v.token === "b").id !== "INC-" + jahr + "-0009", JSON.stringify(reparierteIds));
pruefe("Zähler nach Reparatur fortgeschrieben", parseInt(speicherStand.get("vorgangstriage.zaehler"), 10) >= 10, speicherStand.get("vorgangstriage.zaehler"));

/* freieNummer überspringt belegte Nummern */
const frei1 = engineMitSpeicher.freieNummer("Incident", [{ id: "INC-" + jahr + "-0005" }], [], 4);
pruefe("freieNummer nutzt den Bestand", frei1.id === "INC-" + jahr + "-0006", frei1.id);
const frei2 = engineMitSpeicher.freieNummer("Incident", [{ id: "INC-" + jahr + "-0006" }], [], 4);
pruefe("freieNummer überspringt belegte Nummer", frei2.id === "INC-" + jahr + "-0007", frei2.id);

/* ---------- 4d. Robustheit: Zeitformat, Speicher, Suche, Import ---------- */
const jetzt = Date.now();
const ueberfaellig = engine.restzeit({ status: "offen", erfasst: new Date(jetzt - 90 * 60000).toISOString(), zielMin: 60 });
pruefe("Überfälligkeit in Minuten", ueberfaellig.txt === "überfällig seit 30 Min", ueberfaellig.txt);
const langeUeberfaellig = engine.restzeit({ status: "offen", erfasst: new Date(jetzt - 2880 * 60000).toISOString(), zielMin: 60 });
pruefe("Überfälligkeit > 1 Tag in Tagen", langeUeberfaellig.txt.indexOf("Tag") !== -1 && langeUeberfaellig.txt.indexOf("2820 Min") === -1, langeUeberfaellig.txt);
const langeFrist = engine.restzeit({ status: "offen", erfasst: new Date().toISOString(), zielMin: 2880 });
pruefe("Frist > 1 Tag in Tagen", langeFrist.txt.indexOf("Tage") !== -1, langeFrist.txt);

pruefe("loadAll liefert immer ein Array", Array.isArray(engine.loadAll()));

const suchListe = [
  { id: "INC-2026-0001", kat: "AS/400 & Terminalzugang", text: "Die AS/400-Sitzung bricht ab", status: "offen", prio: 2, prioLabel: "Hoch", reply: "Guten Tag,\n\nDruckproblem" },
  { id: "INC-2026-0002", kat: "Drucken & Scannen", text: "Drucker druckt nicht", status: "offen", prio: 3, prioLabel: "Mittel", reply: "" }
];
pruefe("Mehrwortsuche findet Treffer", engine.filtereVorgaenge(suchListe, { text: "as400 sitzung" }).length === 1);
pruefe("Suche ignoriert Satzzeichen", engine.filtereVorgaenge(suchListe, { text: "as/400 sitzung" }).length === 1);
pruefe("Suche normalisiert Umlaute", engine.filtereVorgaenge([{ id: "X", kat: "Bürgerbüro", text: "Buerger", status: "offen" }], { text: "bürger" }).length === 1);
pruefe("Suche findet keine versteckten Vorlagentexte", engine.filtereVorgaenge(suchListe, { text: "Druckproblem" }).length === 0);

const rohVorgang = { id: "INC-2026-0077", kat: "Drucken & Scannen", text: "Drucker defekt", erfasst: "2026-11-02T09:00:00.000Z" };
const normiert = engine.normalisiereVorgang(rohVorgang);
pruefe("Normalisierung: Priorität unbewertet", normiert.prio === "?", String(normiert.prio));
pruefe("Normalisierung: Status offen", normiert.status === "offen");
pruefe("Normalisierung: Listenfelder", Array.isArray(normiert.steps) && Array.isArray(normiert.ausloeser));
pruefe("Normalisierung: Zielzeit gesetzt", normiert.ziel === "noch offen");
const exportRoh = engine.otrsDatensatz(normiert);
pruefe("OTRS-Export mit Minimaldatensatz", exportRoh.indexOf("OTRS-Ticketnummer") !== -1);
const importRoh = engine.uebernehmeImport([], [], [rohVorgang], []);
pruefe("Import normalisiert Liste", importRoh.liste[0].prio === "?" && importRoh.liste[0].status === "offen");
const importKorbRoh = engine.uebernehmeImport([], [], [], [rohVorgang]);
pruefe("Import normalisiert Papierkorb", importKorbRoh.korb[0].prio === "?" && importKorbRoh.korb[0].status === "offen");

/* ---------- 4e. Schreibpfade unter Sperre ---------- */
speicherStand.clear();
const seed = { typ: "Incident", kat: "Netzwerk & Verbindung", text: "Netz weg", erfasst: "2026-11-03T08:00:00.000Z", replyBasis: "Guten Tag," };
const start = await engineMitSpeicher.speichereVorgang(seed);
pruefe("Transaktion speichert", start.ok === true && start.vorgang.id === "INC-" + jahr + "-0001", start.vorgang && start.vorgang.id);
const id = start.vorgang.id;

const unbekannt = await engineMitSpeicher.aendereVorgang("INC-2026-9999", { otrsNr: "x" });
pruefe("Ändern unbekannter ID liefert null", unbekannt === null);

const geaendert = await engineMitSpeicher.aendereVorgang(id, { otrsNr: "2026110300001" });
pruefe("OTRS-Nummer wird persistiert", !!geaendert && JSON.parse(speicherStand.get("vorgangstriage.vorgaenge"))[0].otrsNr === "2026110300001");
pruefe("OTRS-Nummer im Rückgabewert", geaendert && geaendert.otrsNr === "2026110300001");

const st1 = await engineMitSpeicher.schalteStatus(id);
pruefe("Status wird erledigt", st1 && st1.status === "erledigt", st1 && st1.status);
const st2 = await engineMitSpeicher.schalteStatus(id);
pruefe("Status wird wieder offen", st2 && st2.status === "offen", st2 && st2.status);

const weg = await engineMitSpeicher.loescheVorgang(id);
pruefe("Löschen verschiebt in den Papierkorb", weg && JSON.parse(speicherStand.get("vorgangstriage.vorgaenge")).length === 0 && JSON.parse(speicherStand.get("vorgangstriage.papierkorb")).length === 1);
const zurueck = await engineMitSpeicher.stelleWiederHer(id);
pruefe("Wiederherstellen nach ID", zurueck && JSON.parse(speicherStand.get("vorgangstriage.vorgaenge")).length === 1 && JSON.parse(speicherStand.get("vorgangstriage.papierkorb")).length === 0);
pruefe("Wiederherstellen entfernt Löschdatum", zurueck && zurueck.geloeschtAm === undefined);

await engineMitSpeicher.loescheVorgang(id);
const endgueltig = await engineMitSpeicher.entferneAusKorb(id);
pruefe("Endgültig löschen entfernt aus dem Papierkorb", endgueltig && JSON.parse(speicherStand.get("vorgangstriage.papierkorb")).length === 0);

const zweiter = await engineMitSpeicher.speichereVorgang(Object.assign({}, seed, { text: "Zweiter" }));
const anzahlListe = await engineMitSpeicher.leereListe();
pruefe("Liste leeren verschiebt alles", anzahlListe >= 1 && JSON.parse(speicherStand.get("vorgangstriage.vorgaenge")).length === 0);
const anzahlKorb = await engineMitSpeicher.leereKorb();
pruefe("Papierkorb leeren", anzahlKorb >= 1 && JSON.parse(speicherStand.get("vorgangstriage.papierkorb")).length === 0);

speicherStand.clear();
const sicherung = { id: "INC-" + jahr + "-0042", kat: "Drucken & Scannen", text: "Drucker", erfasst: "2026-11-03T08:00:00.000Z" };
const uebernommen = await engineMitSpeicher.uebernehmeSicherung([sicherung], []);
pruefe("Sicherung übernehmen", uebernommen && uebernommen.uebernommen === 1 && JSON.parse(speicherStand.get("vorgangstriage.vorgaenge")).length === 1);
pruefe("Sicherung schreibt den Zähler", parseInt(speicherStand.get("vorgangstriage.zaehler"), 10) >= 42, speicherStand.get("vorgangstriage.zaehler"));
pruefe("Sperrschlüssel bleibt nicht liegen", !speicherStand.has("vorgangstriage.sperre"));

/* ---------- 4f. Trefferqualität und OTRS-Typzuordnung ---------- */
pruefe("Qualität: unklar", engine.qualitaet(0, true).text === "unklar");
pruefe("Qualität: schwach", engine.qualitaet(45, false).text === "schwach");
pruefe("Qualität: mittel", engine.qualitaet(70, false).text === "mittel");
pruefe("Qualität: klar", engine.qualitaet(90, false).text === "klar");
const mitQualitaet = engine.analyze("Die AS/400-Sitzung bricht ab.");
pruefe("analyze liefert Trefferqualität", mitQualitaet.qualitaet && typeof mitQualitaet.qualitaet.text === "string", JSON.stringify(mitQualitaet.qualitaet));
const ohneQualitaet = engine.analyze("Bitte um Rueckruf.");
pruefe("unklare Meldung: Qualität unklar", ohneQualitaet.qualitaet.text === "unklar", ohneQualitaet.qualitaet.text);
pruefe("Normalisierung setzt Trefferqualität", normiert.qualitaet === "unklar", String(normiert.qualitaet));
pruefe("OTRS-Typen definiert", engine.OTRS_TYPEN["Incident"] && engine.OTRS_TYPEN["Service Request"]);
const sr = Object.assign({}, normiert, { typ: "Service Request" });
const ds = engine.otrsDatensatz(sr);
pruefe("OTRS-Datensatz nutzt Typzuordnung", ds.indexOf("Type:         " + engine.OTRS_TYPEN["Service Request"]) !== -1, ds.split("\n").find(l => l.indexOf("Type:") === 0));
pruefe("OTRS-Datensatz nennt Trefferqualität", ds.indexOf("Trefferqualität:") !== -1);
const altTyp = engine.OTRS_TYPEN["Service Request"];
engine.OTRS_TYPEN["Service Request"] = "Request";
const dsAngepasst = engine.otrsDatensatz(sr);
pruefe("OTRS-Typ ist anpassbar", dsAngepasst.indexOf("Type:         Request") !== -1);
engine.OTRS_TYPEN["Service Request"] = altTyp;

/* ---------- 5. Antwortentwürfe ---------- */
const behauptungen = ["ich habe", "Ich habe", "stelle ich kurzfristig ein Ersatzgerät bereit"];
for (const cat of engine.KB) {
  for (const b of behauptungen) {
    pruefe("Entwurf " + cat.id + " behauptet keine erledigte Handlung", cat.reply.indexOf(b) === -1, b);
  }
  pruefe("Entwurf " + cat.id + " beginnt mit Anrede", cat.reply.indexOf("Guten Tag") === 0 || cat.reply.indexOf("WICHTIG:") === 0);
  pruefe("Entwurf " + cat.id + " hat genug Inhalt", cat.reply.length > 120);
  pruefe("Kategorie " + cat.id + " hat Schritte", cat.steps.length >= 5);
  pruefe("Kategorie " + cat.id + " hat Weitergabehinweis", typeof cat.esc === "string" && cat.esc.length > 30);
}
const signiert = engine.mitSignatur("Guten Tag,", "INC-2026-0001");
pruefe("Signatur enthält Vorgangsnummer", signiert.indexOf("Vorgangsnummer: INC-2026-0001") !== -1);
pruefe("Signatur enthält Unterschrift", signiert.indexOf("Mit freundlichen Grüßen") !== -1);
pruefe("Signatur enthält Namensplatzhalter", signiert.indexOf("[Name]") !== -1);

/* ---------- 6. Offline-Garantie und Wissensbasis ---------- */
pruefe("keine externen URLs", html.indexOf("http://") === -1 && html.indexOf("https://") === -1);
pruefe("kein fetch", html.indexOf("fetch(") === -1);
pruefe("kein XMLHttpRequest", html.indexOf("XMLHttpRequest") === -1);
pruefe("kein WebSocket", html.indexOf("WebSocket") === -1);
pruefe("keine externen Skripte oder Bilder", html.indexOf("src=") === -1);
pruefe("keine Telemetrie", html.indexOf("analytics") === -1 && html.indexOf("gtag(") === -1);
pruefe("kein fest verdrahteter Telefonkanal", html.indexOf("Kanal: Telefon") === -1);
pruefe("14 Kategorien", engine.KB.length === 14, "erhalten: " + engine.KB.length);
for (const cat of engine.KB) {
  const gesehen = {};
  for (const paar of cat.kw) {
    pruefe("Keyword eindeutig in " + cat.id + ": " + paar[0], gesehen[paar[0]] === undefined);
    gesehen[paar[0]] = true;
  }
}

/* ---------- 7. Oberfläche: Tastatur und zugängliche Namen ---------- */
pruefe("Tabs als Tablist", html.indexOf("tablist") !== -1);
pruefe("Roving Tabindex gesetzt", html.indexOf("tabindex") !== -1);
pruefe("Pfeiltasten-Navigation vorhanden", html.indexOf("ArrowRight") !== -1 && html.indexOf("ArrowLeft") !== -1);
pruefe("Details-Button mit Vorgangsnummer", html.indexOf("Details zu ") !== -1);
pruefe("Status-Button mit Vorgangsnummer", html.indexOf("Status für ") !== -1);
pruefe("OTRS-Button mit Vorgangsnummer", html.indexOf("OTRS-Nummer für ") !== -1);
pruefe("Löschen mit Vorgangsnummer", html.indexOf("Vorgang ${esc(v.id)} löschen") !== -1);
pruefe("Papierkorb mit Vorgangsnummer", html.indexOf("Vorgang ${esc(v.id)} endgültig löschen") !== -1);
pruefe("Statusmeldung als Live-Region", html.indexOf("meldung") !== -1 && (html.match(/aria-live/g) || []).length >= 2);
pruefe("Detaildialog vorhanden", html.indexOf("<dialog") !== -1);
/* ---------- Ergebnis ---------- */
console.log("");
if (fehler === 0) {
  console.log("OK: " + pruefungen + " Prüfungen bestanden.");
  process.exit(0);
}
console.log("FEHLER: " + fehler + " von " + pruefungen + " Prüfungen fehlgeschlagen.");
process.exit(1);
