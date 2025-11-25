# 🚀 Quick Deployment Reference

## Free Hosting Options

| Service     | What                   | Free Tier                           | Link                |
| ----------- | ---------------------- | ----------------------------------- | ------------------- |
| **Vercel**  | Frontend (Next.js)     | 100GB bandwidth, unlimited projects | https://vercel.com  |
| **Render**  | Backend + Database     | Web service + PostgreSQL            | https://render.com  |
| **Railway** | Full-stack alternative | $5 credit/month                     | https://railway.app |
| **Fly.io**  | Full-stack alternative | Free tier available                 | https://fly.io      |

---

## Recommended: Vercel + Render

### Backend (Render)

```bash
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**

```
DATABASE_URL=<from Render PostgreSQL>
ACOUSTID_API_KEY=<from acoustid.org>
FRONTEND_URL=<your-vercel-url>
```

### Frontend (Vercel)

```bash
Root Directory: frontend
Framework: Next.js (auto-detected)
Build Command: npm run build
```

**Environment Variables:**

```
NEXT_PUBLIC_API_URL=<your-render-backend-url>
```

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] AcoustID API key obtained
- [ ] Render account created
- [ ] Vercel account created
- [ ] PostgreSQL database created on Render
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated with production URLs
- [ ] App tested in production

---

## Important URLs

**Get AcoustID Key**: https://acoustid.org/new-application

**Render Dashboard**: https://dashboard.render.com

**Vercel Dashboard**: https://vercel.com/dashboard

---

## Cold Start Warning ⚠️

Render free tier sleeps after 15 minutes of inactivity.

**First request after sleep**: 30-60 seconds

**Solutions**:

1. Accept the delay (it's free!)
2. Use a ping service to keep it awake
3. Upgrade to Render Pro ($7/month)

---

## Files to Reference

- `DEPLOYMENT.md` - Full deployment guide
- `DEPLOYMENT_SUMMARY.md` - What was changed
- `.agent/workflows/deploy.md` - Step-by-step workflow
- `backend/.env.example` - Backend environment variables
- `frontend/.env.local.example` - Frontend environment variables

---

**Ready to deploy? Read `DEPLOYMENT.md` or use `/deploy` workflow!**
