# Darts Dashboard

Empfängt Spielergebnisse von einem oder mehreren `darts-quadro-scorer`-Boards
über einen gemeinsamen GitHub Gist, zeigt sie als Kacheln an und erlaubt das
Quittieren übertragener Ergebnisse. Zusätzlich eine einfache Spielerverwaltung.

## Funktionsweise

Kein eigenes Backend — alle Daten liegen in einem GitHub Gist:

- `board-<id>.json` pro Board: Heim/Gast-Namen, Legs-Stand, Status,
  Highlights, Zeitstempel, `acknowledged`-Flag
- `players.json`: flache Liste von Spielernamen

Das Dashboard pollt den Gist alle paar Sekunden per GitHub REST API und
schreibt beim Quittieren bzw. bei Spieler-Änderungen gezielt nur die
betroffene Datei zurück.

## Installation

```bash
npm install
npm run dev
```

## Einrichtung

1. Einen GitHub Personal Access Token mit **nur** dem Scope `gist`
   erstellen (GitHub → Settings → Developer settings → Personal access
   tokens → Fine-grained oder Classic Token, nur Gist-Berechtigung).
2. Einen Gist anlegen (kann leer sein, die erste `board-*.json`-Datei
   kommt vom Scorer).
3. Token und Gist-ID beim ersten Start des Dashboards eingeben — werden
   danach lokal im Browser gespeichert (`localStorage`).

## Tests / Build

```bash
npm test
npm run lint
npm run build
```

## Nicht Teil dieses Projekts

- Die Anbindung der Scorer-App selbst an den Gist (Upload der
  Ergebnisse) ist ein separater Schritt.
- Die Dropdown-Integration der Spielerliste im Scorer folgt später.
