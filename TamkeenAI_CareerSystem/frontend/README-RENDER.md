# Deploying TamkeenAI Frontend to Render

This guide walks through deploying the TamkeenAI frontend on Render.com, ensuring it connects properly to your backend services.

## Prerequisites

- A Render.com account
- Your backend services deployed and running
- Git repository with your frontend code

## Step 1: Create a Web Service on Render

1. Log in to your Render.com account
2. Click "New +" and select "Web Service"
3. Connect your GitHub/GitLab repository
4. Fill in the following details:
   - Name: `tamkeen-frontend` (or your preferred name)
   - Environment: `Static Site`
   - Build Command: `npm install --legacy-peer-deps && npm run build`
   - Publish Directory: `dist`

## Step 2: Configure Environment Variables

In the Render dashboard, add the following environment variables:

```
VITE_API_URL=https://your-main-api.onrender.com
VITE_INTERVIEW_API_URL=https://your-interview-api.onrender.com
VITE_USE_MOCK_DATA=false
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_MOCK_FALLBACK=false
VITE_ENABLE_BACKEND_CHECK=true
```

Replace the URLs with your actual backend service URLs.

## Step 3: Configure Headers and Redirects

Create a `_redirects` file in your `public` directory with the following content:

```
/* /index.html 200
```

## Step 4: Deploy and Test

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Open your deployed site URL to verify it's working
4. Test all major functionalities:
   - Login/registration
   - Backend API connectivity
   - Features requiring backend services

## Troubleshooting

If you encounter connectivity issues:

1. Check the browser console for CORS errors
2. Verify your API URLs in environment variables
3. Check if your backend services are running
4. Try using the built-in health check at `/api/health`

## Automatic Deployment

Render will automatically deploy your site when you push changes to your repository. You can also manually trigger deploys from the Render dashboard. 