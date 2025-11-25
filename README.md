# Daily Life Tools - Setup & Run Guide

A comprehensive web application for audio, video, and image processing with AI-powered tools.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (for database)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd toolbox
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=dailylife

# Music Recognition (AcoustID - FREE!)
ACOUSTID_API_KEY=your_api_key_here
```

**Get FREE AcoustID API Key:**

1. Visit https://acoustid.org/new-application
2. Register your app (takes 1 minute)
3. Copy the API key to your `.env` file

#### Install fpcalc (for Music ID feature)

Download and install fpcalc for audio fingerprinting:

- **Windows**: https://github.com/acoustid/chromaprint/releases/download/v1.6.0/chromaprint-fpcalc-1.6.0-windows-x86_64.zip
- Extract and copy `fpcalc.exe` to `backend` folder or add to PATH

See `fpcalc_install.md` for detailed instructions.

### 3. Frontend Setup

#### Install Node Dependencies

```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd backend
uvicorn main:app --reload
```

Backend will run on: **http://localhost:8000**

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## 🎯 Access the Application

1. Open your browser
2. Go to **http://localhost:3000**
3. Sign up or log in
4. Start using the tools!

---

## 🛠️ Available Tools

- **Audio Tools**: Trim, speed control, format conversion
- **Video Tools**: Remove audio, crop, resize, filters
- **Image Tools**: Crop, filters, resize, background removal
- **Converter**: PDF to Image, Image to PDF, PDF to SVG
- **Socials**: Download media from Instagram, YouTube, etc.
- **Music ID**: Shazam-like song recognition (NEW!)

---

## 📱 Features

✅ **Fully Responsive** - Works on mobile, tablet, and desktop
✅ **Dark Mode** - Beautiful dark theme
✅ **Fast Processing** - Optimized for speed
✅ **Secure** - Your files are processed locally
✅ **Free Tier** - No credit card required

---

## 🔧 Troubleshooting

### Backend Issues

**Port already in use:**

```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

**Database connection error:**

- Make sure PostgreSQL is running
- Check your `.env` credentials

**Music ID not working:**

- Ensure `fpcalc` is installed and in PATH
- Check `ACOUSTID_API_KEY` in `.env`

### Frontend Issues

**Port 3000 already in use:**

```bash
# Next.js will automatically suggest port 3001
# Or specify a port:
npm run dev -- -p 3001
```

**Module not found errors:**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Additional Documentation

- **Music ID Setup**: See `acoustid_setup.md`
- **fpcalc Installation**: See `fpcalc_install.md`
- **Responsive Design**: See `walkthrough.md`

---

## 🎨 Tech Stack

**Frontend:**

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

**Backend:**

- FastAPI
- Python
- PostgreSQL
- yt-dlp
- AcoustID

---

## 📝 Development

### Backend Hot Reload

The `--reload` flag automatically restarts the server when you make changes.

### Frontend Hot Reload

Next.js automatically reloads when you save files.

### Database Migrations

```bash
cd backend
alembic upgrade head
```

---

## 🚢 Deployment to Free Hosting

**Deploy your app to the cloud for FREE!**

We've prepared everything you need to deploy to **Vercel** (frontend) and **Render** (backend).

### Quick Start

1. Read **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions
2. Or use the `/deploy` workflow for guided deployment
3. Check **[DEPLOYMENT_QUICK_REF.md](DEPLOYMENT_QUICK_REF.md)** for quick reference

### What You Get

- ✅ **Frontend**: Vercel (100GB bandwidth, global CDN)
- ✅ **Backend**: Render (free web service + PostgreSQL)
- ✅ **Cost**: $0/month
- ✅ **Auto-deploy**: Push to GitHub → Automatic deployment

### Files Ready for Deployment

- `backend/.env.example` - Backend environment variables
- `frontend/.env.local.example` - Frontend environment variables
- `vercel.json` - Vercel configuration
- Database supports both SQLite (local) and PostgreSQL (production)

**Estimated deployment time**: 15-20 minutes

---

## 💡 Tips

- Keep both servers running in separate terminal windows
- Backend must be running for frontend features to work
- Check browser console for frontend errors
- Check terminal for backend errors
- Use `Ctrl+C` to stop servers

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the terminal output for error messages
2. Ensure all dependencies are installed
3. Verify environment variables are set correctly
4. Make sure both servers are running

---

## 📄 License

MIT License - Feel free to use and modify!

---

**Enjoy using Daily Life Tools! 🎉**
