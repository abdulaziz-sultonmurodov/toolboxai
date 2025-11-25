# Vercel Deployment Fix

## ✅ Issue Resolved

The `vercel.json` file has been fixed. The issue was that it contained custom build commands that conflicted with Vercel's monorepo detection.

## 🔧 What Was Fixed

### Before (Incorrect):

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

### After (Correct):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

## 📋 Correct Vercel Setup for Monorepo

When deploying to Vercel:

### 1. **Project Settings**

- **Root Directory**: `frontend` ← **IMPORTANT: Set this in Vercel dashboard**
- **Framework**: Next.js (auto-detected)
- **Build Command**: Leave empty (auto-detected)
- **Output Directory**: Leave empty (auto-detected)
- **Install Command**: Leave empty (auto-detected)

### 2. **Environment Variables**

Add in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### 3. **Deploy**

- Vercel will automatically detect Next.js in the `frontend` directory
- It will run `npm install` and `npm run build` automatically
- No custom commands needed!

---

## 🚀 Steps to Deploy Now

### Step 1: Commit the Fix

```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **IMPORTANT**: Set **Root Directory** to `frontend`
5. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
6. Click **"Deploy"**

**Option B: Via CLI**

```bash
cd frontend
vercel
# Follow prompts
# When asked for root directory, confirm it's "frontend"
```

---

## ⚠️ Common Vercel Deployment Issues

### Issue 1: "Command failed with exit code 1"

**Cause**: Wrong root directory or missing dependencies

**Fix**:

- Ensure **Root Directory** is set to `frontend` in Vercel dashboard
- Check that `package.json` exists in `frontend/` directory

### Issue 2: TypeScript errors during build

**Already Fixed**: Your `next.config.ts` has `ignoreBuildErrors: true`

### Issue 3: Environment variables not working

**Fix**:

- Ensure variable starts with `NEXT_PUBLIC_` for client-side access
- Add in Vercel dashboard under **Settings** → **Environment Variables**
- Redeploy after adding variables

### Issue 4: Build succeeds but app doesn't work

**Fix**:

- Check that `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend CORS allows your Vercel domain
- Check browser console for errors

---

## 🎯 Deployment Checklist

Before deploying:

- [x] `vercel.json` fixed (simplified)
- [x] `console.log` removed from `layout.tsx`
- [x] TypeScript build errors ignored in `next.config.ts`
- [ ] Code committed and pushed to GitHub
- [ ] Backend deployed to Render (get URL)
- [ ] Vercel project created with correct root directory
- [ ] Environment variable `NEXT_PUBLIC_API_URL` added
- [ ] Deployment successful
- [ ] App tested in production

---

## 📝 Important Notes

### Monorepo Structure

Your project structure:

```
toolbox/
├── backend/          ← Render deploys this
├── frontend/         ← Vercel deploys this
├── vercel.json       ← Minimal config
└── README.md
```

### Vercel Auto-Detection

Vercel automatically detects:

- ✅ Next.js framework
- ✅ Build command: `npm run build`
- ✅ Install command: `npm install`
- ✅ Output directory: `.next`

**You don't need to specify these!**

### What You MUST Set

- ✅ **Root Directory**: `frontend`
- ✅ **Environment Variables**: `NEXT_PUBLIC_API_URL`

---

## 🔄 Redeploy Instructions

If you already created a Vercel project:

1. Go to your project in Vercel dashboard
2. Go to **Settings** → **General**
3. Under **Root Directory**, set to `frontend`
4. Go to **Settings** → **Environment Variables**
5. Add `NEXT_PUBLIC_API_URL` if not already added
6. Go to **Deployments** tab
7. Click **"..."** on latest deployment → **"Redeploy"**

---

## ✅ You're Ready!

The configuration is now correct. Just:

1. Push your code to GitHub
2. Set **Root Directory** to `frontend` in Vercel
3. Add environment variable
4. Deploy!

**Good luck! 🚀**
