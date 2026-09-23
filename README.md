# BINT-Lab

Zur Lernumgebung: https://swrobuts.github.io/BINT-Lab/

Interaktive Lernumgebung zum Modul Business Intelligence im Bachelor Business Analytics der THWS Business School. Sie wird auch im Wirtschaftsinformatik-Schwerpunkt eingesetzt und eignet sich für das selbstständige Lernen.

## Inhalt

Sechs Labs, eine durchgehende Fallstudie, je Lab ein Quiz mit Begründung.

Lab | Thema
--- | ---
01 | Grundlagen Business Intelligence
02 | Daten: Quellen, Modelle, Qualität
03 | KPIs mit DAX, Tableau und Python
04 | Dashboard-Design und Plotly Dash
05 | Fallstudie Retail Analytics (Power BI, Tableau, Plotly Dash)
06 | Digitale Souveränität und Open-Source-BI

## Technik

Statische Seite auf GitHub Pages, zweisprachig Deutsch und Englisch, ohne Build-Schritt, ohne Framework, ohne Anmeldung. Gleiche Formsprache wie die Schwesterumgebungen PROM-Lab, PITM-Lab und DABA-Lab.

```
index.html · lab-0*.html        Seiten (statisches HTML, Sprachfassungen als <span lang>)
assets/bint.css                 gemeinsames Stylesheet (Marineblau #1E3A8A, Himmelblau #38BDF8)
assets/bint.js                  Laufzeit: Sprache, Codebloecke, Quiz, Checkliste, Fortschritt
assets/img/                     Bildschirmfotos aus Power BI und Tableau
data/quiz/lab-0*.json           Quizfragen je Lab (zweisprachig)
data/train.csv                  Superstore-Datensatz, Grundlage aller Uebungen
starter/                        Starterpakete, Tableau-Arbeitsmappe, Power-BI-Projekt
tools/                          Pruefskripte und Generatoren
```

Fortschritt (gelöste Quizfragen, erledigte Labs, Checkliste) bleibt im `localStorage` des Browsers; es gibt kein Konto und keinen Server.

Im Kurs eingesetzte Werkzeuge: Power BI, Tableau, Python, Plotly Dash, Docker.

## Lokal prüfen

Im Repository `python -m http.server 8765 --bind 127.0.0.1` starten.
Die Browserprüfungen benötigen Node.js, Playwright und Chromium, Chrome oder Edge.
Die Python-Beispiele benötigen pandas, numpy, openpyxl, requests, plotly und dash.

```sh
python tools/build_starters.py --check
python tools/check_packages.py
python tools/check_labs.py --base-url http://127.0.0.1:8765
node tools/check_responsive.js http://127.0.0.1:8765
node tools/check_interactions.js http://127.0.0.1:8765
python tools/check_starter_apps.py
```

`check_labs.py` prüft unter anderem, dass jeder als „Läuft unverändert“ gekennzeichnete Codeblock in einer frischen Umgebung durchläuft, dass jede Fragendatei zu `LABS` in `assets/bint.js` passt und dass jede Datei, die ein Block öffnet, im Repo liegt und auf derselben Seite zum Download angeboten wird.

Nach Änderungen an Codeblöcken die Downloads mit `python tools/build_starters.py`
neu erzeugen. Die Codeblöcke werden über `data-name` in den Lab-Seiten gefunden
(`tools/extract_code.js`). Die ZIP-Dateien enthalten ausschließlich die vorgesehenen
Übungsdateien. Lokale `.env`-Dateien, Datensatzkopien und Python-Caches bleiben außen vor.

## Verwandte Umgebungen

PROM-Lab: https://swrobuts.github.io/PROM-Lab/

PITM-Lab: https://swrobuts.github.io/PITM-Lab/

BI-Quiz: https://swrobuts.github.io/bi-quiz/

DABA Lab: https://swrobuts.github.io/daba_lab/
