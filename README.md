# Appliance EconoMetrics

Full-stack appliance TCO analysis for Sri Lankan consumers.

- **Backend**: FastAPI + SQLite — deployed on Render
- **Frontend**: Next.js — deployed on Vercel

## Economic Indices Covered
IRR, NPV, BCR, Payback Period, Inflation, Electricity Escalation, Efficiency Decay, Maintenance & Operation costs.

## Categories
Refrigerators, Washing Machines, Air Conditioners, Televisions — budget/mid/premium tiers.

---

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

---

## Deployment

### Backend → Render
1. Push this repo to GitHub
2. Log in to [render.com](https://render.com) → **New Web Service** → connect your GitHub repo
3. Render auto-detects `render.yaml` and deploys the backend
4. Copy the Render service URL (e.g. `https://appliance-econometrics-api.onrender.com`)

### Frontend → Vercel
1. Log in to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://<your-render-url>` (from step above)
4. Deploy
