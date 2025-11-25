# Deployment Checklist

## ✅ Pre-Deployment Preparation

### Files Created

- [x] `backend/.env.example` - Backend environment variables template
- [x] `frontend/.env.local.example` - Frontend environment variables template
- [x] `vercel.json` - Vercel deployment configuration
- [x] Updated `.gitignore` - Allow .env.example files
- [x] Updated `backend/database.py` - Support PostgreSQL
- [x] Updated `backend/main.py` - Dynamic CORS configuration

### Before You Deploy

1. **Get AcoustID API Key** (if not already done)

   - Visit: https://acoustid.org/new-application
   - Register your app
   - Save the API key

2. **Create GitHub Repository** (if not already done)

   ```bash
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Sign Up for Hosting Services**
   - Vercel: https://vercel.com/signup
   - Render: https://render.com/register

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create PostgreSQL Database**

   - Go to https://dashboard.render.com
   - Click "New +" → "PostgreSQL"
   - Name: `dailylife-db`
   - Plan: **Free**
   - Click "Create Database"
   - **SAVE the Internal Database URL**

2. **Create Web Service**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `dailylife-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Plan: **Free**

3. **Add Environment Variables**

   ```
   DATABASE_URL=<paste Internal Database URL>
   ACOUSTID_API_KEY=<your AcoustID API key>
   FRONTEND_URL=https://your-app.vercel.app
   ```

   (You'll update FRONTEND_URL after deploying frontend)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - **SAVE your backend URL**: `https://dailylife-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. **Import Project**

   - Go to https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project**

   - Framework: Next.js (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

3. **Add Environment Variable**

   ```
   NEXT_PUBLIC_API_URL=https://dailylife-backend.onrender.com
   ```

   (Use your actual Render backend URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (3-5 minutes)
   - **SAVE your frontend URL**: `https://your-app.vercel.app`

---

### Step 3: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Open your backend web service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Save (will trigger automatic redeploy)

---

### Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Try signing up
3. Try logging in
4. Test a tool (e.g., audio trimming)

---

## 📝 Important URLs to Save

| Service           | URL                                      | Notes                |
| ----------------- | ---------------------------------------- | -------------------- |
| Frontend (Vercel) | `https://your-app.vercel.app`            | Your main app URL    |
| Backend (Render)  | `https://dailylife-backend.onrender.com` | API endpoint         |
| Database (Render) | Internal URL from Render                 | Don't share publicly |

---

## ⚠️ Known Limitations

### Render Free Tier

- **Cold starts**: Service sleeps after 15 min of inactivity
- **First request**: May take 30-60 seconds to wake up
- **Database**: Free PostgreSQL expires after 90 days
- **Solution**: Upgrade to paid tier ($7/month) or create new DB every 90 days

### Vercel Free Tier

- **Bandwidth**: 100 GB/month (plenty for personal use)
- **Build time**: 6000 minutes/month
- **Serverless functions**: 100 GB-hours/month

---

## 🔄 Continuous Deployment

Both services support automatic deployments:

**Push to GitHub** → **Automatic deployment** on both Vercel and Render

No manual steps needed after initial setup!

---

## 🛠️ Troubleshooting

### Backend not responding

1. Check Render logs
2. Verify environment variables
3. Check database connection
4. Ensure using `$PORT` variable

### Frontend can't connect to backend

1. Check `NEXT_PUBLIC_API_URL` in Vercel
2. Verify CORS settings in backend
3. Check browser console for errors

### Database errors

1. Verify `DATABASE_URL` is correct
2. Check if database is running
3. Ensure tables are created (auto-created on first run)

---

## 🎉 Next Steps

1. **Custom Domain** (Optional)

   - Add your domain in Vercel settings
   - Update DNS records
   - Free SSL included!

2. **Monitoring** (Optional)

   - Set up Sentry for error tracking
   - Enable Vercel Analytics

3. **Upgrade** (When needed)
   - Render Pro: $7/month (no cold starts)
   - Vercel Pro: $20/month (more resources)

---

**Your app is now live! 🚀**
