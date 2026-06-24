# 🌊 Ocean Guardian — Setup Guide (Windows + PostgreSQL 17)

## Step 1: Configure your database password

Open `backend/.env` and replace `YOUR_PASSWORD` with your PostgreSQL password:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ocean_guardian
```

## Step 2: Create the database

Open PowerShell and run:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE ocean_guardian;"
```

## Step 3: Run the schema

```powershell
cd "c:\ICT_2026\ITDI 203 Programming\year Project\MARATON\MAR-PRO\backend"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d ocean_guardian -f schema.sql
```

## Step 4: Seed the database

```powershell
node seed.js
```

## Step 5: Start the backend

```powershell
node index.js
```

Visit: http://localhost:3001/api/health  
You should see: `{"status":"ok","timestamp":"..."}`

## Step 6: Start the frontend

Open a **second** PowerShell terminal:

```powershell
cd "c:\ICT_2026\ITDI 203 Programming\year Project\MARATON\MAR-PRO\frontend"
npm run dev
```

Visit: http://localhost:5173

## ✅ Endpoints to test in browser

| URL | What you should see |
|-----|---------------------|
| http://localhost:3001/api/health | `{status: "ok"}` |
| http://localhost:3001/api/ecosystems | JSON array of 4 zones |
| http://localhost:3001/api/species | JSON array of 6 species |
| http://localhost:3001/api/events/recent | 30 fishing events |
| http://localhost:3001/api/events/summary | Chart data by day |
| http://localhost:3001/api/alerts | 3 unresolved alerts |
| http://localhost:3001/api/sightings | 5 verified sightings |

## Add PostgreSQL to PATH permanently (optional)

In PowerShell (run as administrator):
```powershell
[System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Program Files\PostgreSQL\17\bin", "Machine")
```

Then restart PowerShell and you can use `psql` directly.

## GFW API Key

Once you receive your API key from globalfishingwatch.org, add it to `backend/.env`:
```
GFW_API_KEY=your_key_here
```
The cron job will activate automatically on next restart.
