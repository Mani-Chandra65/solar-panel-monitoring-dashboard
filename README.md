# ☀️ Solar Panel Monitoring Dashboard

![Status](https://img.shields.io/badge/Status-Ready-brightgreen)
![Stack](https://img.shields.io/badge/Stack-MEAN-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v8.0-green)
![Express](https://img.shields.io/badge/Express-v4.18-lightgrey)
![Angular](https://img.shields.io/badge/Angular-v17-red)
![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack MEAN (MongoDB, Express, Angular, Node.js) application for monitoring solar panel performance with **real-time anomaly detection** and **complete CRUD operations**.

## 📸 Preview

```
┌─────────────────────────────────────────────────────┐
│  ☀️ Solar Panel Monitoring Dashboard               │
│                        [➕ Add Reading] [✓ Normal] │
├─────────────────────────────────────────────────────┤
│  ⚡ Power: 117W  🌡️ Temp: 42°C  ⚡ 26V  🔌 4.5A   │
│  📊 Charts: Power/Temp & Voltage/Current Trends     │
│  🚨 Anomalies: Real-time detection & alerts         │
│  ✏️ Edit  🗑️ Delete  ➕ Create readings            │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [CRUD Operations](#crud-operations)
- [Anomaly Detection](#anomaly-detection)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 📊 Monitoring
- **Real-time Dashboard**: Monitor voltage, current, power, and temperature
- **Interactive Charts**: 2 live charts powered by Chart.js showing trends
- **Auto-refresh**: Data updates every 10 seconds automatically
- **Visual Alerts**: Color-coded indicators (Normal/Warning/Critical)

### 🎯 CRUD Operations
- **➕ Create**: Add new readings via UI form
- **📖 Read**: View all readings, latest stats, and anomalies
- **✏️ Update**: Edit any reading with instant anomaly re-detection
- **🗑️ Delete**: Remove readings with confirmation

### 🚨 Anomaly Detection
- **Statistical Algorithm**: 6-rule detection system with baseline analysis
- **Automatic Flagging**: Identifies performance drops and overheating
- **Anomaly Reasons**: Clear explanations for each detected issue
- **History Tracking**: View all past anomalies with timestamps
- **Auto-refresh**: Dashboard updates every 10 seconds
- **RESTful API**: Upload readings and retrieve historical data

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **dotenv** - Environment configuration

### Frontend
- **Angular 17** - Frontend framework (standalone components)
- **ng2-charts** - Chart.js wrapper for Angular
- **RxJS** - Reactive programming

### Algorithm
- **Statistical Anomaly Detection**: Rule-based + threshold detection
  - Power deviation analysis (70% threshold)
  - Temperature spike detection (80°C critical + 2σ statistical)
  - Voltage/Current range checking
  - Power factor validation

---

## 🏗️ Architecture

```
┌─────────────┐      HTTP/REST       ┌─────────────┐      Mongoose       ┌─────────────┐
│   Angular   │ ◄──────────────────► │  Express    │ ◄─────────────────► │  MongoDB    │
│  Dashboard  │                      │   Server    │                     │  Database   │
└─────────────┘                      └─────────────┘                     └─────────────┘
      │                                     │
      │                                     │
      ▼                                     ▼
  Chart.js                          Anomaly Detection
  Visualization                        Algorithm
```

### Data Flow
1. **Solar Panel** → Readings (voltage, current, power, temperature)
2. **Backend API** → Receives data via `/api/upload`
3. **Anomaly Detector** → Analyzes against historical baseline
4. **MongoDB** → Stores reading with anomaly flag
5. **Angular Dashboard** → Fetches and visualizes data

---

## 🧠 Anomaly Detection Algorithm

### Logic Overview

```javascript
if (power < avgPower * 0.7) → Low Power Anomaly
if (temperature > 80°C) → High Temperature Anomaly
if (voltage outside ±20% of avg) → Voltage Anomaly
if (current outside expected range) → Current Anomaly
if (V * I ≠ Power ±30%) → Power Factor Anomaly
```

### Detection Rules

1. **Power Output Check**
   - Flags if power drops below 70% of historical average
   - Indicates potential panel degradation or shading

2. **Temperature Monitoring**
   - Critical threshold: 80°C
   - Statistical: > 2 standard deviations from mean
   - Indicates overheating or cooling system failure

3. **Voltage Deviation**
   - Normal range: ±20% of average voltage
   - Detects electrical faults or connection issues

4. **Current Analysis**
   - Checks for spikes (>150%) or drops (<60%)
   - Identifies short circuits or load problems

5. **Power Factor Validation**
   - Compares calculated power (V×I) with measured power
   - Detects sensor calibration issues

### Statistical Baseline
- Uses last 100 **non-anomalous** readings
- Calculates mean and standard deviation
- Falls back to basic rules if insufficient data (<10 readings)

---

## � Quick Start

```bash
# Clone the repository
git clone https://github.com/Mani-Chandra65/solar-panel-monitoring.git
cd solar-panel-monitoring

# Install and run (use install.ps1 for Windows)
# Backend
cd backend
npm install
npm run seed  # Seed database with sample data
npm start     # Run on http://localhost:3000

# Frontend (in new terminal)
cd ../frontend
npm install
npm start     # Run on http://localhost:4200
```

## �📦 Installation

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/downloads))

### Step-by-Step Setup

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/Mani-Chandra65/solar-panel-monitoring.git
cd solar-panel-monitoring
```

#### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

**Create `.env` file:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/solar_panel_monitoring

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/solar_panel_monitoring?retryWrites=true&w=majority
```

**Seed Database (200 sample readings):**
```bash
npm run seed
```
*This creates ~30 anomalies for testing*

**Start Backend Server:**
```bash
npm start
```
✅ Server running: `http://localhost:3000`

#### 3️⃣ Frontend Setup
```bash
cd ../frontend
npm install
```

**Start Angular Development Server:**
```bash
npm start
```
✅ Dashboard running: `http://localhost:4200`

### 🪟 Windows PowerShell Setup
Run the automated installer:
```powershell
.\install.ps1
```

---

## 🚀 Usage

### 1. Start MongoDB
```bash
# If using local MongoDB
mongod
```

### 2. Start Backend
```bash
cd backend
npm start
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

### 4. Access Dashboard
Open browser: `http://localhost:4200`

### 5. View Real-time Data
- Dashboard auto-refreshes every 10 seconds
- Watch for anomaly alerts (red indicators)
- Explore charts and statistics

---

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api`

#### 📖 Read Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/data` | Get all readings (default limit: 50) |
| GET | `/data?limit=100` | Get readings with custom limit |
| GET | `/data?anomalyOnly=true` | Get only anomalous readings |
| GET | `/data/:id` | Get single reading by ID |
| GET | `/data/latest` | Get most recent reading |
| GET | `/data/stats` | Get statistical summary |

#### ✏️ Create Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Create single reading |
| POST | `/upload/batch` | Create multiple readings |

#### 🔄 Update Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/data/:id` | Update reading by ID |

#### 🗑️ Delete Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| DELETE | `/data/:id` | Delete single reading |
| DELETE | `/data/all` | Delete all readings (testing) |

### Example: Upload Reading

**Request:**
```bash
POST http://localhost:3000/api/upload
Content-Type: application/json

{
  "voltage": 25.5,
  "current": 4.2,
  "power": 107.1,
  "temperature": 45.8
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "voltage": 25.5,
    "current": 4.2,
    "power": 107.1,
    "temperature": 45.8,
    "isAnomaly": false,
    "timestamp": "2025-10-28T10:30:00.000Z"
  },
  "anomalyDetected": false
}
```

---

## 📂 Project Structure

```
WPM_External/
│
├── backend/
│   ├── config/
│   │   └── database.js           # MongoDB connection
│   ├── models/
│   │   └── Reading.js             # Mongoose schema
│   ├── routes/
│   │   └── readings.js            # API endpoints
│   ├── utils/
│   │   └── anomalyDetector.js     # Detection algorithm
│   ├── .env                       # Environment variables
│   ├── package.json
│   ├── seed.js                    # Database seeder
│   └── server.js                  # Express server
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/
│   │   │   │   └── reading.model.ts
│   │   │   ├── services/
│   │   │   │   └── data.service.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   └── app.component.css
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```



## 🧪 Testing

### Test Anomaly Detection
1. **Seed Database**: `npm run seed` (in backend)
2. **Check Stats**: Visit `http://localhost:3000/api/data/stats`
3. **View Anomalies**: Visit dashboard and check "Recent Anomalies" section

### Manual Testing
Use Postman or curl to upload anomalous readings:

```bash
# Low Power Anomaly
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"voltage":24,"current":4,"power":50,"temperature":45}'

# High Temperature Anomaly
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"voltage":26,"current":4.5,"power":117,"temperature":90}'
```

---

## 📊 Sample Data

Seed script generates:
- **200 readings** over simulated time
- **~15% anomalies** (realistic failure rate)
- **4 anomaly types**:
  1. Low power output
  2. High temperature
  3. Voltage drops
  4. Current spikes

---

## 🔒 MongoDB Atlas Setup (Optional)

1. Create free account: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/solar_panel_monitoring
   ```

---

## 🎯 CRUD Operations

### Frontend UI
- **➕ Create**: Click "Add Reading" button, fill form, submit
- **📖 Read**: View dashboard (auto-refreshes every 10s)
- **✏️ Edit**: Click edit button (✏️) on any anomaly
- **🗑️ Delete**: Click delete button (🗑️) with confirmation

### API Examples

**CREATE:**
```bash
POST http://localhost:3000/api/upload
{"voltage": 26, "current": 4.5, "power": 117, "temperature": 42}
```

**READ:**
```bash
GET http://localhost:3000/api/data/:id
```

**UPDATE:**
```bash
PUT http://localhost:3000/api/data/:id
{"voltage": 25, "current": 4, "temperature": 45}
```

**DELETE:**
```bash
DELETE http://localhost:3000/api/data/:id
```

Full guide: See [CRUD_OPERATIONS.md](CRUD_OPERATIONS.md)



## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Update documentation for new features
- Test changes before submitting

---

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

```
MIT License - Free to use for educational and commercial purposes
```

---

## 👨‍💻 Author

**Created for Academic Project**  
🎓 Course: Full Stack Development / IoT Monitoring Systems  
🛠️ Tech Stack: MEAN (MongoDB, Express, Angular, Node.js)  
🔬 Feature: Statistical Anomaly Detection Algorithm

---

## 🌟 Acknowledgments

- **Chart.js** - Beautiful data visualization
- **MongoDB** - Flexible NoSQL database
- **Angular** - Powerful frontend framework
- **Express.js** - Fast backend framework

---

## 📞 Support

For issues or questions:
- 📧 Open an [Issue](https://github.com/Mani-Chandra65/solar-panel-monitoring/issues)
- 📖 Read the [Documentation](./SETUP_GUIDE.md)
- 💬 Check [Discussions](https://github.com/Mani-Chandra65/solar-panel-monitoring/discussions)
1. Check API is running: `http://localhost:3000`
2. Check MongoDB connection
3. Verify CORS settings if frontend can't reach backend
4. Check browser console for errors

---

## 🎯 Quick Start Checklist

- [ ] MongoDB installed/accessible
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend `.env` configured
- [ ] Database seeded (`npm run seed`)
- [ ] Backend server running (`npm start`)
- [ ] Frontend dependencies installed
- [ ] Frontend server running (`npm start`)
- [ ] Dashboard accessible at `http://localhost:4200`

---

**Happy Monitoring! 🌞⚡**
