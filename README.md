```
 ___  ____  _  _  ____  __  ____  ____ 
/ __)(  _ \( \/ )(_  _)(  )(  __)(  _ \
\__ \ ) __/ )  /   )(   )(  ) _)  )   /
(___/(__)  (__/   (__) (__)(____)(__)\_)

Transportation Fleet Monitoring System
```

[![CI/CD](https://github.com/SPYZIER/SPYZIER/actions/workflows/ci.yml/badge.svg)](https://github.com/SPYZIER/SPYZIER/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

---

## 📖 Description

**SPYZIER** is a real-time transportation fleet monitoring system designed to provide comprehensive visibility into vehicle fleets. Track GPS locations, monitor vehicle health, manage drivers, and gain actionable insights through a modern, responsive dashboard.

---

## ✨ Features

- 🗺️ **Real-Time GPS Tracking** — Live vehicle positions on an interactive map
- 📡 **WebSocket Streaming** — Instant updates without page refresh
- 🚗 **Fleet Management** — Add, update, and manage your entire vehicle fleet
- 👤 **Driver Management** — Assign drivers to vehicles and track performance
- 🔧 **Vehicle Health Monitoring** — Engine status, fuel levels, diagnostics
- 📊 **Analytics Dashboard** — Charts, reports, and KPIs for fleet performance
- 🔔 **Alert System** — Configurable alerts for speeding, geofencing, and maintenance
- 🔐 **Role-Based Access Control** — Admin, fleet manager, and driver roles
- 📈 **Metrics & Monitoring** — Prometheus metrics exposed, Grafana dashboards
- 🌐 **RESTful API** — Documented with Swagger/OpenAPI 3.0

---

## 🛠️ Tech Stack

| Layer        | Technology                              |
|-------------|------------------------------------------|
| Backend      | Java 17, Spring Boot 3.x, Spring Security |
| Database     | PostgreSQL 15                            |
| Cache        | Redis 7                                  |
| Frontend     | React 18, Vite, TypeScript               |
| Mapping      | Leaflet.js / Mapbox                      |
| Real-time    | WebSockets (STOMP over SockJS)           |
| Monitoring   | Prometheus + Grafana                     |
| Container    | Docker, Docker Compose                   |
| Orchestration | Kubernetes                              |
| CI/CD        | GitHub Actions                           |
| Web Server   | Nginx (reverse proxy)                    |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                 ┌────────▼────────┐
                 │   Nginx / LB    │  :80 / :443
                 └────────┬────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
   │   Frontend  │ │   /api      │ │   /ws      │
   │  React SPA  │ │   Backend   │ │  WebSocket │
   │  Nginx:80   │ │ Spring:8080 │ │  Backend   │
   └─────────────┘ └──────┬──────┘ └─────┬──────┘
                          │              │
               ┌──────────┼──────────────┘
               │          │
        ┌──────▼──┐  ┌─────▼─────┐
        │Postgres │  │   Redis   │
        │  :5432  │  │   :6379   │
        └─────────┘  └───────────┘
               │
        ┌──────▼──────────────┐
        │  Prometheus :9090   │
        │  Grafana    :3000   │
        └─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) 24+
- [Docker Compose](https://docs.docker.com/compose/install/) v2+

### Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/SPYZIER/SPYZIER.git
cd SPYZIER

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Access the application

| Service        | URL                          | Credentials         |
|---------------|-------------------------------|---------------------|
| Frontend       | http://localhost              | -                   |
| Backend API    | http://localhost:8080/api     | -                   |
| Swagger UI     | http://localhost:8080/swagger-ui.html | -          |
| Prometheus     | http://localhost:9090         | -                   |
| Grafana        | http://localhost:3000         | admin / admin       |

---

## 📚 API Documentation

Full API documentation is available via Swagger UI at:

```
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON spec:
```
http://localhost:8080/v3/api-docs
```

### Key Endpoints

| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| POST   | /api/auth/login        | Authenticate user            |
| POST   | /api/auth/register     | Register new user            |
| GET    | /api/vehicles          | List all vehicles            |
| POST   | /api/vehicles          | Add new vehicle              |
| GET    | /api/vehicles/{id}     | Get vehicle details          |
| GET    | /api/vehicles/{id}/location | Get current location    |
| GET    | /api/drivers           | List all drivers             |
| GET    | /api/fleet/stats       | Fleet-wide statistics        |
| WS     | /ws/tracking           | Real-time tracking WebSocket |

---

## ⚙️ Environment Variables

### Backend

| Variable                  | Description                    | Default                          |
|--------------------------|--------------------------------|----------------------------------|
| `SPRING_DATASOURCE_URL`   | PostgreSQL JDBC URL            | `jdbc:postgresql://localhost:5432/spyzier` |
| `SPRING_DATASOURCE_USERNAME` | DB username                | `spyzier`                        |
| `SPRING_DATASOURCE_PASSWORD` | DB password                | *(required)*                     |
| `SPRING_REDIS_HOST`       | Redis hostname                 | `localhost`                      |
| `SPRING_REDIS_PORT`       | Redis port                     | `6379`                           |
| `SPRING_REDIS_PASSWORD`   | Redis password                 | *(required)*                     |
| `JWT_SECRET`              | JWT signing secret (min 256-bit) | *(required)*                   |
| `SPRING_PROFILES_ACTIVE`  | Active Spring profile          | `default`                        |
| `SERVER_PORT`             | Server port                    | `8080`                           |

### Frontend

| Variable              | Description              | Default                         |
|----------------------|--------------------------|----------------------------------|
| `VITE_API_BASE_URL`   | Backend API base URL     | `http://localhost:8080`          |
| `VITE_WS_URL`         | WebSocket URL            | `ws://localhost:8080/ws`         |

---

## 💻 Development Setup

### Backend

```bash
cd backend

# Requires: Java 17+, Maven 3.9+, PostgreSQL 15, Redis 7

# Start dependencies with Docker
docker-compose up postgres redis -d

# Run with development profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
./mvnw test

# Build JAR
./mvnw clean package -DskipTests
```

### Frontend

```bash
cd frontend

# Requires: Node.js 20+

# Install dependencies
npm ci

# Start development server (port 5173)
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.25+)
- `kubectl` configured
- Nginx Ingress Controller installed

### Deploy

```bash
# Create namespace
kubectl apply -f k8s/namespace.yml

# Create secrets (edit k8s/secrets.yml with real base64-encoded values first)
kubectl apply -f k8s/secrets.yml

# Deploy infrastructure
kubectl apply -f k8s/postgres-deployment.yml
kubectl apply -f k8s/redis-deployment.yml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n spyzier --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n spyzier --timeout=60s

# Deploy application
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml

# Deploy ingress
kubectl apply -f k8s/ingress.yml

# Check status
kubectl get all -n spyzier
```

### Scaling

```bash
# Scale backend replicas
kubectl scale deployment spyzier-backend --replicas=4 -n spyzier

# Scale frontend replicas
kubectl scale deployment spyzier-frontend --replicas=3 -n spyzier
```

---

## 📸 Screenshots

> _Screenshots will be added here once the UI is finalized._

| Dashboard | Fleet Map | Vehicle Details |
|-----------|-----------|----------------|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the SPYZIER Team</strong>
</div>
