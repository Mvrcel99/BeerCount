# BierLog – Event Logging System

Das Backend für das Projekt **"BierLog"** (Modul: Neue Datenbankkonzepte) der Gruppe A12. Diese Applikation dient zum revisionssicheren Loggen von Bier-Events (Schulden/Guthaben) der DHBW Heidenheim (WWI2024).

## Tech-Stack

* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Datenbank:** [InfluxDB 2.7](https://www.influxdata.com/) (Time-Series DB für lückenlose Historie)
* **Infrastruktur:** Docker & Docker Compose
* **Dokumentation:** Swagger / OpenAPI

---

## Schnellstart (Deployment)

Stellen Sie sicher, dass **Docker** installiert ist. Führen Sie im Hauptverzeichnis des Projekts folgenden Befehl aus:
Startet InfluxDB, Backend und Frontend im Hintergrund

```bash
docker-compose up -d --build
```

### Verfügbare Dienste & Dashboards

| Dienst | URL | Anmeldedaten |
| :--- | :--- | :--- |
| **Frontend (Web App)** | [http://localhost](http://localhost) | – |
| **API Swagger Docs** | [http://localhost:3000/api/docs](http://localhost:3000/api/docs) | – |
| **InfluxDB Dashboard** | [http://localhost:8086](http://localhost:8086) | `admin` / `biercounter123` |

---

## API Dokumentation (Swagger)

Die gesamte API ist über Swagger dokumentiert. Dort können Endpunkte direkt getestet werden.

**URL:** `http://localhost:3000/api/docs`

*Hinweis: Für administrative Endpunkte muss im Header der `x-access-key` (Standard: `ADMIN_KEY_123`) gesetzt werden.*

---

## Entwicklung

Falls Sie das Backend ohne Docker (lokal) für die Entwicklung starten möchten:

1.  Abhängigkeiten installieren: `npm install`
2.  Umgebungsvariablen in der `.env` prüfen.
3.  Starten: `npm run start:dev`

---




## Rollen & Zugriff (Access Keys)
Das System nutzt **Access Keys**, um zwischen den verschiedenen Benutzerrollen zu wechseln:

| Rolle            | Access Key          | Beschreibung & Berechtigungen                                                                 |
|:-----------------|:--------------------|:----------------------------------------------------------------------------------------------|
| **Admin** | `ADMIN_KEY_123`     | Voller Zugriff: Admin-Dashboard, User-Verwaltung, Bearbeiten/Löschen von Events, Statistiken. |
| **Kurssprecher** | `KURS_KEY_123`      | Erweitertes Logging: Darf sowohl Störungen (+1) als auch Bier-Ausgaben (beliebig) erfassen.   |
| **Student** | `STUDENT_KEY_123`   | Basis-Logging: Kann die Bilanz einsehen und Störungen (+1) für andere melden.                 |

**Hinweis zum Rollenwechsel:** Um die Rolle zu wechseln, lösche den aktuellen Key über die "Acess-Key"-Funktion im Header.

---
*Projekt im Rahmen der Vorlesung "Neue Datenbankkonzepte" – DHBW Heidenheim WWI24A Gruppe A12.*


