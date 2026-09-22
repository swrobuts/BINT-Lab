# Starterpakete

Fertige Dateien zu den Labs 04, 05 und 06 – damit langer Code nicht aus der
Seite kopiert werden muss. Die Python- und SQL-Dateien werden aus den
Lab-Seiten erzeugt (`tools/build_starters.py`) und bleiben dadurch
automatisch synchron mit dem, was im Lab steht.

| Ordner | Inhalt | Lab |
|---|---|---|
| `lab-04-dash/` | `charts.py`, `app.py`, `requirements.txt`, `Dockerfile` | Lab 04 |
| `lab-05-fallstudie/` | `explore.py`, `app.py`, `measures.dax`, `bint-klar.json`, `requirements.txt` | Lab 05 |
| `lab-06-stack/` | `docker-compose.yml`, `init/`, `verify.sql`, `.env.example` | Lab 06 |

Der Datensatz `train.csv` liegt bewusst nicht in den Paketen, sondern einmal
unter `data/`. Jede README sagt, wohin er kopiert werden muss.

Die Python-Dateien sind für die Ausführung
in einer frischen Umgebung vorbereitet. Der Lab-06-Stack importiert 9.800
Zeilen und liefert in `verify.sql` dieselben Zahlen wie pandas.

`BINT_Tableau_Uebung.twbx` enthält train.csv und die berechneten Felder aus Lab 03 und Lab 05, `BINT_Tableau_Dashboard.twbx` zusätzlich die vier Arbeitsblätter und das fertige Dashboard aus Lab 05. Beide sind gepackte Arbeitsmappen und laufen ohne weitere Verbindung in Tableau Desktop und Tableau Public.
