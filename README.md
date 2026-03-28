# Bier Counter - Event Logging Backend

Dieses Projekt ist das Backend für den "Bier Counter" (Neue Datenbankkonzepte). Es nutzt **NestJS** als API-Framework und **InfluxDB** als Time-Series-Datenbank, um Events (Störungen/Bier-Schulden) revisionssicher zu loggen.

## Voraussetzungen
Bevor du startest, stelle sicher, dass Folgendes auf deinem Rechner installiert ist:
* **Node.js** (v18 oder höher empfohlen)
* **npm** (Node Package Manager)
* **Docker & Docker Compose** (für die Datenbank)

---

## Projekt starten 

### 1. Datenbank hochfahren
Wir nutzen Docker, um die InfluxDB lokal bereitzustellen. Öffne dein Terminal im Hauptverzeichnis und starte den Container:
```bash
docker-compose up -d

```

*Das InfluxDB-Dashboard ist nun unter `http://localhost:8086` erreichbar (Login: admin / biercounter123).*

### 2. Umgebungsvariablen (.env) anlegen

Erstelle im `backend`-Ordner eine Datei namens `.env` und füge folgende Zugangsdaten ein:

```env
PORT=3000
NODE_ENV=development

# InfluxDB Konfiguration
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=super-secret-auth-token
INFLUX_ORG=dhbw
INFLUX_BUCKET=bier_events

```

### 3. Backend-Abhängigkeiten installieren

Wechsle in den `backend`-Ordner und installiere die benötigten Node-Pakete:

```bash
cd backend
npm install

```

### 4. Server starten

Starte das NestJS-Backend im Entwicklungsmodus (mit Auto-Reload):

```bash
npm run start:dev

```
