# StudyList

A study app with a mobile frontend and a .NET API backend.

- `frontend/` — Expo (React Native) app
- `backend/` — ASP.NET Core Web API with SQL Server (Entity Framework Core)

## Running locally

**Backend**

1. Make sure SQL Server Express is running locally (the connection string is in `backend/StudyList.API/appsettings.json`).
2. `cd backend/StudyList.API`
3. `dotnet run --launch-profile http` (listens on port 5282)

**Frontend**

1. `cd frontend`
2. `npm install`
3. Set `LAPTOP_IP` in the files under `app/` to your computer's local network IP.
4. `npx expo start`
