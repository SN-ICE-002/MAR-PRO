# 🌊 Ocean Guardian — Developer Setup Guide

If you have just cloned this project and already have a PostgreSQL database created (e.g., named `ocean_guardian`), follow these steps to link it and get the project running.

---

### Step 1: Configure Environment Variables
Navigate to the `backend` folder and locate the `.env` file. You need to ensure the `DATABASE_URL` matches your local PostgreSQL credentials.

1. Open `MAR-PRO/backend/.env`.
2. Update the `DATABASE_URL` line:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/ocean_guardian
   ```
   *   Replace `USER` with your Postgres username (usually `postgres`).
   *   Replace `PASSWORD` with your Postgres password.
   *   Replace `5432` if you are using a different port.

---

### Step 2: Initialize the Database Tables
Even if the database exists, it is likely empty. You need to create the tables and insert the required country data.

1. Open your VS Code Terminal.
2. Make sure you are in the `backend` directory:
   ```powershell
   cd MAR-PRO/backend
   ```
3. Run the following command to execute the full setup script:
   ```powershell
   psql -U postgres -d ocean_guardian -f full_setup.sql
   ```
   *(Note: This creates all tables + the 18 Pacific Island countries record.)*

---

### Step 3: Install Backend Dependencies
Before running the server, you must install the required Node.js packages.

1. In the same terminal (backend folder), run:
   ```powershell
   npm install
   ```

---

### Step 4: Seed the Database (Optional)
If you want to populate the database with sample sightings, fishing events, and alerts for testing:

1. Run the seed script:
   ```powershell
   node seed.js
   ```

---

### Step 5: Start the Server
Now you are ready to start the backend!

1. Run the development server:
   ```powershell
   npm run dev
   ```
   *The server should now say: `✅ Connected to PostgreSQL database`.*

---

### Troubleshooting
*   **"psql is not recognized"**: You need to add the PostgreSQL `bin` folder to your Windows Path environment variables.
*   **Connection Refused**: Check if your PostgreSQL service is actually running in Windows Services.
*   **Authentication Failed**: Double-check the password in your `.env` file.
