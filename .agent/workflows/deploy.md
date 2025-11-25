---
description: Deploy app to Vercel (frontend) and Render (backend)
---

# Deploy Daily Life Tools to Free Hosting

This workflow guides you through deploying your app to **Vercel** (frontend) and **Render** (backend).

## Prerequisites

1. GitHub account (to push your code)
2. Vercel account (free - sign up at https://vercel.com)
3. Render account (free - sign up at https://render.com)

---

## Part 1: Prepare Your Code

### 1. Create/Update `.gitignore`

Ensure sensitive files are not committed:

```bash
# Check if .gitignore exists and has necessary entries
cat .gitignore
```

### 2. Update Frontend Environment Variables

Create `frontend/.env.local.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Update Backend for Production

Create `backend/.env.example`:

```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=dailylife
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
ACOUSTID_API_KEY=your_api_key_here
FRONTEND_URL=http://localhost:3000
```

### 4. Add CORS Configuration

Ensure `backend/main.py` has proper CORS for production.

### 5. Commit and Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

## Part 2: Deploy Backend to Render

### 1. Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `dailylife-db`
   - **Database**: `dailylife`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **Save the connection details** (Internal Database URL)

### 2. Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `dailylife-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: **Free**

### 3. Add Environment Variables on Render

In the web service settings, add:

```
DATABASE_URL=<paste Internal Database URL from step 1>
ACOUSTID_API_KEY=<your AcoustID API key>
FRONTEND_URL=<will add after Vercel deployment>
```

### 4. Deploy

Click **"Create Web Service"** - Render will build and deploy automatically.

**Note your backend URL**: `https://dailylife-backend.onrender.com`

---

## Part 3: Deploy Frontend to Vercel

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 3. Add Environment Variables

In project settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://dailylife-backend.onrender.com
```

### 4. Deploy

Click **"Deploy"** - Vercel will build and deploy automatically.

**Note your frontend URL**: `https://your-app.vercel.app`

---

## Part 4: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Open your backend web service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Save - Render will automatically redeploy

---

## Part 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try signing up/logging in
3. Test a tool (e.g., audio trimming)

---

## 🎉 You're Live!

Your app is now deployed:

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://dailylife-backend.onrender.com

---

## 📝 Important Notes

### Render Free Tier Limitations

- **Web services spin down after 15 minutes of inactivity**
- First request after inactivity may take 30-60 seconds (cold start)
- **Free PostgreSQL expires after 90 days** - you'll need to create a new one

### Vercel Free Tier Limitations

- 100 GB bandwidth/month
- Serverless function execution: 100 hours/month
- More than enough for personal projects!

---

## 🔄 Automatic Deployments

Both Vercel and Render support automatic deployments:

- **Push to GitHub** → Automatic deployment
- No manual steps needed after initial setup!

---

## 🛠️ Troubleshooting

### Backend Issues

**Check Render logs:**

1. Go to Render dashboard
2. Click your web service
3. View **Logs** tab

**Common issues:**

- Missing environment variables
- Database connection errors
- Port binding (ensure using `$PORT`)

### Frontend Issues

**Check Vercel logs:**

1. Go to Vercel dashboard
2. Click your project
3. View deployment logs

**Common issues:**

- API URL not set correctly
- CORS errors (check backend CORS settings)

---

## 🔐 Security Checklist

- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Enable HTTPS (automatic on Vercel/Render)
- ✅ Set proper CORS origins
- ✅ Use strong database passwords

---

## 💡 Next Steps

1. **Custom Domain**: Add your own domain on Vercel (free)
2. **Monitoring**: Set up error tracking (Sentry free tier)
3. **Analytics**: Add Vercel Analytics (free)
4. **Upgrade**: Consider paid tiers for production apps

---

**Happy Deploying! 🚀**
