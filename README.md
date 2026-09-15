# BINT-Lab

Zur Lernumgebung: https://swrobuts.github.io/BINT-Lab/

Interaktive Lernumgebung zum Modul Business Intelligence im Bachelor Business Analytics der THWS Business School. Sie wird auch im Wirtschaftsinformatik-Schwerpunkt eingesetzt und eignet sich für das selbstständige Lernen.

## Inhalt

Sechs Labs und eine durchgehende Fallstudie.

Lab | Thema
--- | ---
01 | Grundlagen Business Intelligence
02 | Daten: Quellen, Modelle, Qualitaet
03 | KPIs mit DAX und Python
04 | Dashboard-Design und Plotly Dash
05 | Fallstudie Retail Analytics
06 | Digitale Souveraenitaet und Open-Source-BI

## Technik

Statische Seite auf GitHub Pages, zweisprachig Deutsch und Englisch, ohne Build-Schritt und ohne Anmeldung. Im Kurs eingesetzte Werkzeuge: Power BI, Python, Plotly Dash.

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

Nach Änderungen an Codeblöcken die Downloads mit `python tools/build_starters.py`
neu erzeugen. Die ZIP-Dateien enthalten ausschließlich die vorgesehenen
Übungsdateien. Lokale `.env`-Dateien, Datensatzkopien und Python-Caches bleiben außen vor.

## Verwandte Umgebungen

BI-Quiz: https://swrobuts.github.io/bi-quiz/

DABA Lab: https://swrobuts.github.io/daba_lab/
