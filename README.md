# Home Inventory

A simple protected pantry inventory app built with Next.js, Prisma, PostgreSQL, Tailwind, and shadcn-style components.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your PostgreSQL database.
3. Set a long random `AUTH_SECRET`.
4. Set `SEED_USER_EMAIL` and `SEED_USER_PASSWORD`.
5. Run:

```bash
npm install
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```
Start db: 
```
docker compose up -d 
```
Stop db: (destroys the container) 
```
docker compose down
```

Pause db: (better for day to day development)
```
docker compose stop
```

The seed command creates the registered user used for login and adds a few starter pantry items when the inventory is empty.
