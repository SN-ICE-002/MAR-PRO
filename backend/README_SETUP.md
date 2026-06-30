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

---

### Step 2: Install Backend Dependencies
Before running the server, you must install the required Node.js packages.

1. Open your VS Code Terminal.
2. Make sure you are in the `backend` directory:
   ```powershell
   cd MAR-PRO/backend
   ```
3. Run:
   ```powershell
   npm install
   ```

---

### Step 3: Start the Server (Auto-Setup)
The database setup (creating tables, applying migrations, and inserting seed data) is now **fully automatic**. Just start the server and it will handle everything for you.

1. Run the development server:
   ```powershell
   npm run dev
   ```
   *The server will detect if your database is empty and automatically run the initialization and seed scripts. You should see logs like `📁 Database schema not found. Initializing...` on the first run.*

---

### Step 4: Verify the Setup
Once the server is running, the API will be available at `http://localhost:3001`.
You can visit `http://localhost:3001/api/ecosystems` in your browser to confirm that the seeded data is being served.


---

### Troubleshooting
*   **"psql is not recognized"**: You need to add the PostgreSQL `bin` folder to your Windows Path environment variables.
*   **Connection Refused**: Check if your PostgreSQL service is actually running in Windows Services.
*   **Authentication Failed**: Double-check the password in your `.env` file.
