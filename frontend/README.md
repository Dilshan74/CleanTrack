# DengueGuard AI — Frontend

React (Vite) single-page app for the DengueGuard AI platform. Three role-based
experiences share one design system: **Citizen**, **PHI** (Public Health
Inspector) and **Admin**.

## Getting started

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

`/api/*` requests are proxied to `http://localhost:5000` (override with
`VITE_API_PROXY`). Set `VITE_API_URL` to call an API directly instead.

## Scripts

| Script            | Description                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the Vite dev server       |
| `npm run build`   | Production build into `dist/`   |
| `npm run preview` | Serve the production build      |
| `npm run lint`    | Lint with ESLint                |

## Folder structure

```
frontend/
├── public/                 favicon, logo, static images
└── src/
    ├── assets/             images, icons, fonts, styles
    ├── components/
    │   ├── common/         Button, Card, Table, Modal, Pagination, …
    │   ├── layout/         Navbar, Sidebar, Header, Footer
    │   ├── charts/         recharts wrappers
    │   ├── maps/           risk map
    │   ├── notifications/  notification list items
    │   └── ai/             image uploader, prediction card, confidence bar
    ├── layouts/            AuthLayout, CitizenLayout, PHILayout, AdminLayout
    ├── pages/              auth, citizen, phi, admin, errors (one folder per page)
    ├── routes/             AppRoutes + per-role route groups + ProtectedRoute
    ├── services/           axios instance and one module per API domain
    ├── context/            Auth, Notification and Theme providers
    ├── hooks/              useAuth, useApi, useNotification, useTheme
    ├── utils/              constants, validators, helpers, formatDate, storage
    ├── theme/              design tokens (palette, typography)
    ├── App.jsx
    ├── main.jsx
    └── index.css           Tailwind v4 theme + CSS variables
```

## Notes

- Pages currently render mock data from `src/utils/constants.js`; the modules in
  `src/services/` are wired to real endpoints and ready to swap in.
- Auth state is kept in `AuthContext` and persisted through `utils/storage.js`.
  `routes/ProtectedRoute.jsx` guards each role group.
