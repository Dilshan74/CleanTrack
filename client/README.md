# CleanTrack — Frontend (client)

Smart garbage-collection management UI for residents, drivers, and admins.
Built with **React + Vite**, **React Router**, **Tailwind CSS**, and **Axios**.

The app ships with mock data and works fully offline. As soon as a real backend
is available at `VITE_API_BASE_URL`, every service switches to live API calls
automatically (falling back to mock data only if a request fails).

## Tech stack

- React 18 + Vite 5 (JSX)
- React Router DOM 6
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Axios
- lucide-react icons
- React Context for auth, `localStorage` for demo sessions

## Getting started

```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

Other scripts:

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # eslint
```

## Environment

Copy `.env.example` to `.env` and adjust:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=CleanTrack
```

## Demo login

The app starts at `/login`. **Any** valid-looking email and password work in
demo mode — pick a role to land in the matching portal:

| Role     | Lands on   |
| -------- | ---------- |
| Resident | `/user`    |
| Driver   | `/driver`  |
| Admin    | `/admin`   |

Sessions persist in `localStorage` (`cleantrack_token`, `cleantrack_user`).

## Folder structure

```text
client/
├── public/
│   └── assets/
├── src/
│   ├── assets/            # images, icons, logo.png
│   ├── components/
│   │   ├── common/        # Navbar, Sidebar, NotificationBell, Loader, ProtectedRoute
│   │   ├── user/          # UserSidebar
│   │   ├── driver/        # DriverSidebar
│   │   └── admin/         # AdminSidebar
│   ├── layouts/           # UserLayout, DriverLayout, AdminLayout
│   ├── pages/
│   │   ├── auth/          # Login, Register
│   │   ├── user/          # Dashboard, Profile, CollectionSchedule, Notifications, ReportComplaint, Settings
│   │   ├── driver/        # Dashboard, TodaysSchedule, UpdateCollectionStatus, LiveLocation, Notifications, Settings
│   │   └── admin/         # Dashboard, ManageUsers, ManageDrivers, ManageTrucks, ManageRoutes, ManageCollections, Reports, Notifications
│   ├── routes/            # AppRoutes, UserRoutes, DriverRoutes, AdminRoutes
│   ├── services/          # api, authService, userService, driverService, adminService
│   ├── context/           # AuthContext
│   ├── hooks/             # useAuth, useLocation
│   ├── utils/             # constants, helpers
│   ├── styles/            # theme.js, index.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── vite.config.js
```

## Auth & routing

- `context/AuthContext.jsx` holds the session; consume it with the `useAuth`
  hook.
- `components/common/ProtectedRoute.jsx` guards routes by authentication and
  role. Each role has its own route file (`UserRoutes`, `DriverRoutes`,
  `AdminRoutes`) mounted under `/user/*`, `/driver/*`, `/admin/*` from
  `AppRoutes.jsx`.
- The driver **Live Location** page uses the `useLocation` hook, which reads the
  browser Geolocation API and falls back to a simulated moving position when GPS
  is unavailable or denied.

## Connecting a backend

Each service in `src/services` calls the API first and falls back to mock data.
Implement matching REST endpoints (e.g. `POST /auth/login`,
`GET /user/dashboard`, `GET /admin/overview`, …) and the UI will use them with
no component changes.

> Note: Vite requires an `index.html` at the project root — it is the app entry
> and loads `src/main.jsx`.
