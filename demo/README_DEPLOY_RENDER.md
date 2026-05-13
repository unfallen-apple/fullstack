# Deploying to Render (Free tier) — Quick Guide

This project can be deployed to Render.com without Docker. This guide shows the recommended settings and environment variables to run your Spring Boot app with a Supabase (Postgres) database and keep health checks working.

---

## 1) Prepare Supabase (Postgres)
- Create a Supabase project and get connection info (host, port, db name, user, password).
- Build a JDBC URL (include SSL):

  `jdbc:postgresql://<HOST>:<PORT>/<DBNAME>?sslmode=require`

- You can also use the provided `DATABASE_URL` from Supabase, but convert it to JDBC form above.

## 2) Render: Create Web Service (no Docker)
1. Push your repo to GitHub and connect it to Render.
2. In Render dashboard: `New` → `Web Service` → choose your repo and branch.
3. Use these settings:
   - **Environment**: `Docker` = No
   - **Build Command**: `./gradlew bootJar`
   - **Start Command**: `java -Dserver.port=$PORT -jar build/libs/*.jar`
   - **Region / Instance**: Choose default. Free plan available (may sleep on inactivity).

4. Add Environment Variables (in Render dashboard → Environment):
   - `JDBC_DATABASE_URL` = `jdbc:postgresql://<HOST>:5432/<DBNAME>?sslmode=require`
   - `DB_USER` = `<db user>` (optional if included in JDBC URL)
   - `DB_PASSWORD` = `<db password>` (optional if included in JDBC URL)
   - `FRONTEND_URL` = `https://<your-frontend-domain>` (for CORS)
   - `FRONTEND_URL` = `https://junyoungkim.vercel.app` (for CORS)
   - `SUPABASE_URL` = `https://<your-project>.supabase.co`
   - `SUPABASE_KEY` = `<your-service-role-key>`
   - `SUPABASE_BUCKET` = `uploads`
   - `SPRING_PROFILES_ACTIVE` = `prod` (optional)

5. Health check path (Render settings): set to `/actuator/health` (render will use it to check app readiness).

---

## 3) Local testing before deploy
Set env vars locally and run:

Windows PowerShell:
```powershell
$env:JDBC_DATABASE_URL='jdbc:postgresql://<HOST>:5432/<DB>?sslmode=require'
$env:DB_USER='<user>'
$env:DB_PASSWORD='<pass>'
./gradlew bootRun
```

macOS/Linux:
```bash
export JDBC_DATABASE_URL='jdbc:postgresql://<HOST>:5432/<DB>?sslmode=require'
export DB_USER='<user>'
export DB_PASSWORD='<pass>'
./gradlew bootRun
```

Open `http://localhost:8080/actuator/health` to verify health endpoint.

---

## 4) Keep service responsive on free tier
- Free instances may sleep on inactivity. Options:
  - Use an external uptime ping service (UptimeRobot) to ping your app every 5 minutes. May help but not guaranteed.
  - Use Render's free policy: occasional pings can keep instance warmer but consider paid plan if always-on required.
  - Configure a small scheduled job on another platform to hit the health endpoint periodically.

---

## 5) Important production notes
- Do NOT commit secrets to Git. Use Render environment variables.
- Use Flyway or Liquibase for DB migrations instead of `hibernate.ddl-auto=update` in production.
- Expose only necessary actuator endpoints. Current config exposes `health` and `info`.
- Make sure `FRONTEND_URL` points to your deployed frontend domain for CORS.

---

## 6) Render-specific quick checklist
- [ ] Repo connected to Render
- [ ] Build command `./gradlew bootJar` set
- [ ] Start command `java -Dserver.port=$PORT -jar build/libs/*.jar` set
- [ ] `JDBC_DATABASE_URL` set in Environment
- [ ] `FRONTEND_URL` set in Environment
- [ ] Health check path `/actuator/health` configured

---

If you want, I can also:
- Add `spring-boot-starter-actuator` (done) and verify `/actuator/health` is accessible.
- Add a small Flyway migration scaffolding.
- Create a sample GitHub Action to auto-deploy to Render on push.

Which of these next steps should I implement for you?