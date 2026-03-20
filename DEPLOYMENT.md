# Railway Deployment Guide

## Prerequisites
- Railway account
- GitHub repository connected to Railway

## Deployment Steps

### 1. Backend Deployment
1. Go to Railway dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect the backend service automatically
5. Configure environment variables:
   - `DATABASE_URL`: PostgreSQL connection string (Railway provides this)
   - `JWT_SECRET`: Generate a secure random string
   - `REFRESH_SECRET`: Generate another secure random string
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your frontend Railway URL (after deployment)

### 2. Frontend Deployment
1. In the same project, click "Add Service"
2. Select "GitHub Repo" again
3. Set the source directory to `frontend`
4. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend Railway URL + `/api`

### 3. Database Setup
1. Add a PostgreSQL service to your project
2. Railway will automatically provide the DATABASE_URL
3. The backend will run migrations automatically on deployment

### 4. Environment Variables Examples

#### Backend Environment Variables:
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-here
REFRESH_SECRET=your-super-secure-refresh-secret-here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.railway.app
```

#### Frontend Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

### 5. Post-Deployment
1. Test both services are running
2. Verify database migrations completed
3. Test user registration and login
4. Verify CORS is working between frontend and backend

## Troubleshooting

### Common Issues:
- **CORS errors**: Ensure FRONTEND_URL is correctly set in backend
- **Database connection**: Verify DATABASE_URL is correct
- **Build failures**: Check logs for missing dependencies
- **API errors**: Ensure NEXT_PUBLIC_API_URL points to correct backend URL

### Health Checks:
- Backend health: `GET /api/health`
- Frontend should load at the root URL

## URLs After Deployment
- Backend: `https://your-backend-name.railway.app`
- Frontend: `https://your-frontend-name.railway.app`
