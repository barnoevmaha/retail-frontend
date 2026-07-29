# retail-frontend

Customer-facing e-commerce frontend for the Retail Management System. Built with React + Vite + Tailwind CSS.

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 4
- React Router DOM 6
- Axios

## Pages

- Home
- Catalog (search/filter by barcode, SKU, color, size)
- Product (variant picker, image gallery)
- Cart

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | /api | Backend API base URL |

In production, set this to your backend URL (e.g., https://backend-production.up.railway.app).

## Development

```bash
cp .env.example .env
npm install
npm run dev
```

Starts on port 5173 with Vite proxy forwarding /api to localhost:8000.

## Production Build

```bash
VITE_API_URL=https://your-backend-url npm run build
```

Or via Docker:

```bash
docker build --build-arg VITE_API_URL=https://your-backend-url -t retail-frontend .
```

## Railway Deployment

1. Push this repo to GitHub
2. In Railway, create a new project from the repo
3. Set environment variable: VITE_API_URL
4. Deploy
