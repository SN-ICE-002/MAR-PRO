# 🌊 Ocean Guardian

A real-time marine ecosystem monitoring platform for Vanuatu's ocean zones.

## Stack
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Vite + Leaflet + Recharts
- **Data**: Global Fishing Watch API + Community sightings

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
npm install
createdb ocean_guardian
psql ocean_guardian < schema.sql
node seed.js
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## ENV Variables

### backend/.env
```
PORT=3001
DATABASE_URL=postgresql://localhost/ocean_guardian
GFW_API_KEY=your_key_here
```

### frontend/.env
```
VITE_API_URL=http://localhost:3001
```
