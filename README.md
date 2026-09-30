# University Student Information & Grading Portal

An enterprise-grade academic management system tracking departments, faculty, students, course registration, prerequisite enforcement, continuous grade assessments, and final published transcripts.

---

## 🏛️ Architecture & Directory Overview

```
Project_SQL_Server/
├── database/
│   ├── 01_schema.sql         # Production T-SQL schema with constraints, triggers & indexes
│   ├── 02_seed.sql           # Executable seed data for testing & development
│   └── init_local_db.bat     # Windows batch script to initialize local SQL Server database
├── backend/
│   ├── config/               # Django project settings and root URLs
│   ├── apps/
│   │   ├── core/             # Custom User model, JWT authentication, permissions
│   │   ├── academic/         # Courses, sections, enrollments, DAG prerequisite engine
│   │   └── grading/          # Continuous grading engine, roster batch marks, transcript
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FacultyGradebookMatrix.jsx  # Pure React JSX spreadsheet grade editor
│   │   │   └── StudentAcademicPortal.jsx   # Pure React JSX transcript & CGPA viewer
│   │   ├── schemas/
│   │   │   └── grading.js                  # Pure JS Zod validation schemas
│   │   ├── api/
│   │   │   └── client.js                   # Unified fetch API client with mock fallbacks
│   │   ├── App.jsx                         # Main dashboard view
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json          # React + Vite + TailwindCSS (Zero TypeScript)
├── docker-compose.yml        # Orchestration (MSSQL 2022, Django API, React Vite)
├── .env.example              # Environment variables template
└── README.md
```

---

## 💻 Local Windows Development Quick Start

### 1. Database Initialization (Local SQL Server)
Make sure SQL Server is running locally (e.g. `localhost\SQL2026` or `localhost`). Then run:
```bat
cd database
init_local_db.bat
```
This automatically runs `01_schema.sql` and `02_seed.sql` on `localhost\SQL2026` using `UniversityPortalDB`.

### 2. Backend API (Django + DRF)
```bash
cd backend
python manage.py check
python manage.py runserver 8000
```
- API Root: [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
- Admin Panel: [http://localhost:8000/admin/](http://localhost:8000/admin/) (Default Superuser: `admin@university.edu` / `Admin@123456`)

### 3. Frontend App (Pure React JSX + TailwindCSS)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🐳 Quick Start with Docker

1. **Clone & Setup Environment:**
   ```bash
   cp .env.example .env
   ```

2. **Launch Containers:**
   ```bash
   docker compose up -d
   ```

3. **Execute SQL Schema & Seed Data:**
   ```bash
   # Execute schema
   docker exec -i university_mssql /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P 'YourStrong#Passw0rd2026!' -i /docker-entrypoint-initdb.d/01_schema.sql

   # Execute seed data
   docker exec -i university_mssql /opt/mssql-tools/bin/sqlcmd \
     -S localhost -U sa -P 'YourStrong#Passw0rd2026!' -i /docker-entrypoint-initdb.d/02_seed.sql
   ```

4. **Access Applications:**
   - **Frontend App:** [http://localhost:5173](http://localhost:5173)
   - **Backend API:** [http://localhost:8000/api/v1/](http://localhost:8000/api/v1/)
   - **SQL Server:** `localhost:1433` (User: `sa`)
