# 🚨 DATABASE CONNECTION ERROR - QUICK FIX

## ❌ Error You're Seeing:

```
could not translate host name "host" to address
```

## 🔍 The Problem:

The `DATABASE_URL` environment variable in Render is not set to your actual PostgreSQL connection string. It's using the example value from `.env.example`.

---

## ✅ THE FIX (5 Steps)

### Step 1: Get PostgreSQL Connection String

1. Go to https://dashboard.render.com
2. Click on your **PostgreSQL database** (e.g., `dailylife-db`)
3. Look for **"Internal Database URL"** in the database info
4. **Copy the entire URL** - it looks like:
   ```
   postgresql://user_abc123:pass_xyz789@dpg-abc123-a.oregon-postgres.render.com/db_name
   ```

### Step 2: Update Web Service Environment Variable

1. Go back to Render dashboard
2. Click on your **Web Service** (backend)
3. Click **"Environment"** tab (left sidebar)
4. Find the `DATABASE_URL` variable
5. **Delete the old value**
6. **Paste your actual PostgreSQL URL** from Step 1
7. Click **"Save Changes"**

### Step 3: Wait for Redeploy

- Render will automatically redeploy (5-10 minutes)
- Watch the **Logs** tab to see progress

### Step 4: Verify Deployment

Check logs for:

```
Uvicorn running on http://0.0.0.0:10000
```

### Step 5: Test

Visit:

```
https://your-backend.onrender.com/health
```

Should return:

```json
{ "status": "healthy" }
```

---

## 📋 Environment Variables Checklist

Make sure these are set in Render → Environment tab:

| Variable           | Example Value                               | Where to Get                                              |
| ------------------ | ------------------------------------------- | --------------------------------------------------------- |
| `DATABASE_URL`     | `postgresql://user:pass@host.render.com/db` | ✅ From your PostgreSQL database in Render                |
| `ACOUSTID_API_KEY` | `abc123xyz`                                 | Get from https://acoustid.org/new-application             |
| `FRONTEND_URL`     | `https://your-app.vercel.app`               | Your Vercel deployment URL (add after deploying frontend) |

---

## ⚠️ Common Mistakes

❌ **Wrong DATABASE_URL values:**

- `postgresql://user:password@host:5432/database` (example from .env.example)
- `sqlite:///./dailylife.db` (SQLite, won't work on Render)
- Leaving it empty

✅ **Correct DATABASE_URL:**

- The actual Internal Database URL from your Render PostgreSQL database
- Starts with `postgresql://`
- Contains your actual database hostname (ends with `.render.com`)

---

## 🔍 How to Find Your Database URL

### Method 1: From PostgreSQL Dashboard

1. Render Dashboard → PostgreSQL database
2. Scroll down to **"Connections"** section
3. Copy **"Internal Database URL"**

### Method 2: From Info Tab

1. Render Dashboard → PostgreSQL database
2. Click **"Info"** tab
3. Look for **"Internal Database URL"**
4. Click the copy icon

---

## 🧪 Test Database Connection Locally (Optional)

If you want to test the connection locally:

```bash
cd backend
pip install psycopg2-binary
python
```

Then in Python:

```python
import os
from sqlalchemy import create_engine

# Replace with your actual DATABASE_URL
DATABASE_URL = "postgresql://user:pass@host.render.com/db"
engine = create_engine(DATABASE_URL)
connection = engine.connect()
print("✅ Connected successfully!")
connection.close()
```

---

## 📝 Complete Environment Variables Setup

Here's what your Render Environment tab should look like:

```
DATABASE_URL=postgresql://dailylife_user:abc123xyz@dpg-abc123-a.oregon-postgres.render.com/dailylife_db

ACOUSTID_API_KEY=your_acoustid_api_key_here

FRONTEND_URL=https://your-app.vercel.app
```

**All three must be set!**

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ No database connection errors in logs
- ✅ Logs show "Uvicorn running on http://0.0.0.0:XXXX"
- ✅ Service status shows "Live" (green)
- ✅ `/health` endpoint returns `{"status": "healthy"}`
- ✅ `/docs` shows FastAPI documentation

---

## 🆘 Still Getting Errors?

### Error: "password authentication failed"

- **Cause**: Wrong database credentials
- **Fix**: Copy the Internal Database URL again (credentials might have changed)

### Error: "database does not exist"

- **Cause**: Database name in URL doesn't match
- **Fix**: Use the exact Internal Database URL from Render

### Error: "SSL required"

- **Cause**: PostgreSQL requires SSL connection
- **Fix**: This should work automatically with Render's PostgreSQL URL

---

**After fixing DATABASE_URL, your backend should deploy successfully! 🚀**
