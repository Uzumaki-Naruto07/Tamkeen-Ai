# TamkeenAI Frontend Deployment Guide for Render

This guide provides step-by-step instructions for deploying the TamkeenAI frontend on Render.com.

## Preparation

1. Make sure your backend services are already deployed on Render
2. Have your backend API URLs ready (Main API and Interview API)

## Deployment Steps

### Option 1: Using the Render Dashboard

1. Log in to your Render account
2. Click "New" and select "Static Site"
3. Connect your GitHub/GitLab repository
4. Configure with these settings:
   - **Name:** `tamkeen-frontend` (or your preferred name)
   - **Root Directory:** `TamkeenAI_CareerSystem/frontend` (if using the monorepo)
   - **Build Command:** `./render-build.sh`
   - **Publish Directory:** `dist`

5. Add these environment variables:
   ```
   VITE_API_URL=https://your-main-api.onrender.com
   VITE_INTERVIEW_API_URL=https://your-interview-api.onrender.com
   VITE_USE_MOCK_DATA=false
   VITE_ENABLE_MOCK_DATA=false
   VITE_ENABLE_MOCK_FALLBACK=false
   VITE_ENABLE_BACKEND_CHECK=true
   ```

6. Click "Create Static Site"

### Option 2: Using render.yaml

1. Ensure the `render.yaml` file in your repository is configured correctly
2. Log in to your Render account
3. Go to "Blueprints" section
4. Click "New Blueprint Instance"
5. Connect to your repository
6. Review settings and click "Apply"

## Troubleshooting

If you encounter build errors:

1. **"Cannot find module 'react-dom/client'"**:
   - The error is likely due to React dependency configuration
   - Our custom build script `render-build.sh` should fix this by using a simplified Vite config

2. **Blank page after deployment**:
   - Check browser console for errors
   - Verify environment variables are set correctly
   - Check that the SPA routing is configured properly with the `_redirects` file

3. **API connection issues**:
   - Verify your backend URLs are correct in environment variables
   - Check CORS settings on your backend services
   - Use the built-in health check feature we implemented

## Health Check System

The frontend includes a health check system that will automatically:

1. Verify connectivity to all backend services
2. Show notifications when services become available/unavailable
3. Provide detailed error information when backend services are down

This helps diagnose connection issues between frontend and backend. 