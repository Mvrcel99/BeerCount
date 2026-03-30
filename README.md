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

*Das InfluxDB-Dashboard ist nun unter `http://locnalhost:8086` erreichbar (Login: admin / biercounter123).*

### 2. Backend-Abhängigkeiten installieren

Wechsle in den `backend`-Ordner und installiere die benötigten Node-Pakete:

```bash
cd backend
npm install

```

### 3. Server starten

Starte das NestJS-Backend im Entwicklungsmodus (mit Auto-Reload):

```bash
npm run start:dev

```
### 4. Frontend-Abhängigkeiten installieren

Wechsle in den `frontend`-Ordner und installiere die benötigten Node-Pakete:

```bash
cd frontend
npm install

```

### 5. Frontend starten

Starte das React_frontend:

```bash
npm run dev

```

---

### Rollen & Zugriff (Access Keys)
Das System nutzt **Access Keys**, um zwischen den verschiedenen Benutzerrollen zu wechseln:

| Rolle            | Access Key          | Beschreibung & Berechtigungen                                                                 |
|:-----------------|:--------------------|:----------------------------------------------------------------------------------------------|
| **Admin** | `ADMIN_KEY_123`     | Voller Zugriff: Admin-Dashboard, User-Verwaltung, Bearbeiten/Löschen von Events, Statistiken. |
| **Kurssprecher** | `KURS_KEY_123`      | Erweitertes Logging: Darf sowohl Störungen (+1) als auch Bier-Ausgaben (beliebig) erfassen.   |
| **Student** | `STUDENT_KEY_123`   | Basis-Logging: Kann die Bilanz einsehen und Störungen (+1) für andere melden.                 |

**Hinweis zum Rollenwechsel:** Um die Rolle zu wechseln, lösche den aktuellen Key über die "Acess-Key"-Funktion im Header.


