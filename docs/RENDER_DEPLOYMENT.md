# Render.com Deployment Guide: EcoGraph Auto-Linker Microservice

This guide explains how to deploy the standalone Python FastAPI Auto-Linker service on [Render.com](https://render.com).

---

## 1. Repository Blueprint Configuration

We have placed `render.yaml` directly at the root of your repository (`EcoQuest/render.yaml`):

```
EcoQuest/
├── render.yaml            # Root Render Blueprint file (points to backend/)
└── backend/
    ├── main.py            # FastAPI service & auto-linker NLP pipeline
    ├── requirements.txt   # Python dependencies
    ├── Dockerfile         # Docker container definition
    └── render.yaml        # Subdirectory Render Blueprint spec
```

---

## 2. Deploying on Render (Step-by-Step)

### Step A: Push local changes to GitHub
Make sure to commit and push the newly created `render.yaml` file to your `main` branch:

```bash
git add .
git commit -m "Add Render blueprint render.yaml and Python auto-linker backend"
git push origin main
```

### Step B: Deploy Blueprint on Render
1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** ➔ Select **Blueprint**.
3. Connect your **`IshanG2111/EcoQuest`** repository.
4. Leave **Blueprint Path** as the default: `render.yaml`.
5. Render will automatically read `render.yaml` from root and build the `ecograph-autolinker` service.
6. Click **Apply**. Render will build and deploy your Python backend!

---

## 3. Connecting Render Backend to EcoQuest Next.js App

Once deployed, Render will generate your web service URL (e.g. `https://ecograph-autolinker.onrender.com`).

Copy this URL and add it to your `.env.local` file (and Vercel environment variables):

```env
PYTHON_BACKEND_URL="https://ecograph-autolinker.onrender.com"
```

The Next.js `POST /api/admin/ecograph/ai-ingest` route will automatically route AI ingestion requests to your live Render microservice!
