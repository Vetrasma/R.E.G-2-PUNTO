# R.E.G. EUROPA - Deployment Instructions

## 1. Frontend (Vercel)
The frontend is a React Single Page Application (SPA) built with Vite.

### Steps:
1. Connect your GitHub repository to Vercel.
2. Set the **Build Command** to `npm run build`.
3. Set the **Output Directory** to `dist`.
4. Add the following Environment Variables in Vercel:
   - `VITE_API_URL`: URL of your backend (Google Cloud Run).

## 2. Backend (Google Cloud Run)
The backend is a Node.js Express server with an SQLite database.

### Steps:
1. Build the Docker image:
   ```bash
   docker build -t gcr.io/[PROJECT_ID]/reg-europa-backend .
   ```
2. Push the image to Google Container Registry:
   ```bash
   docker push gcr.io/[PROJECT_ID]/reg-europa-backend
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy reg-europa-backend \
     --image gcr.io/[PROJECT_ID]/reg-europa-backend \
     --platform managed \
     --region [REGION] \
     --allow-unauthenticated
   ```
4. **Important**: Since SQLite is used, data will be lost on container restart unless you use a mounted volume (Cloud Run now supports Cloud Storage FUSE or NFS). For production, consider migrating to **Cloud SQL (PostgreSQL)**.

## 3. Environment Variables (Backend)
Configure these in Google Cloud Run or Secret Manager:

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `JWT_SECRET` | Secret for JWT signing |
| `ENCRYPTION_KEY` | 32-character key for AES-256 |
| `SMTP_HOST` | SMTP server for email alerts |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `IDEALISTA_API_KEY` | Spain Idealista API Key |
| `DADOS_GOV_PT_API_KEY` | Portugal Open Data API Key |
| `ETALAB_API_KEY` | France Housing Data API Key |
| `GOVDATA_DE_API_KEY` | Germany Open Data API Key |
| `SWISS_GEOADMIN_API_KEY` | Switzerland GeoAdmin API Key |

## 4. Scheduled Tasks
The system uses `node-cron` for internal scheduling. Ensure the container has enough memory and CPU to handle background tasks. For higher reliability, use **Google Cloud Scheduler** to trigger the `/api/agents/detect` endpoint via HTTP.
