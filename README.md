# PawPoint — Veterinary Store Management (React)

A pure React.js application for pet food, medicine, and inventory management.

## Features

- **Login** with Email/Password and Mobile OTP (demo flow)
- **Store** — product catalog with search, category & pet-type filters, sorting, stock-aware add-to-cart
- **Cart** — quantity controls, GST summary, place order (auto-updates stock)
- **Inventory** — stats dashboard, inline price/stock editing, add/delete products
- Data persists in the browser via localStorage (no backend needed)

## Tech stack

- React 19 + TypeScript
- Vite
- React Router DOM v7
- Tailwind CSS v4
- lucide-react icons

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Push to Git

```bash
git init
git add .
git commit -m "PawPoint veterinary store app"
git remote add origin <your-repo-url>
git push -u origin main
```

## Project structure

```
src/
├── main.tsx              # React entry point
├── App.tsx               # Routes (/, /store, /cart, /inventory)
├── index.css             # Tailwind theme (cream/teal palette, fonts)
├── lib/
│   ├── store.tsx         # Global state: products, cart, auth (Context + localStorage)
│   └── utils.ts          # cn() class helper
├── components/
│   ├── AppHeader.tsx     # Top navigation
│   └── RequireAuth.tsx   # Route guard
├── pages/
│   ├── Login.tsx         # Email/password + Mobile OTP sign-in
│   ├── Store.tsx         # Product catalog
│   ├── Cart.tsx          # Cart + checkout
│   └── Inventory.tsx     # Inventory management
└── assets/               # Product images
```
