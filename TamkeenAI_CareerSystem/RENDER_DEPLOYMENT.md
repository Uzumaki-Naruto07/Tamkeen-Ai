# Deploying TamkeenAI Career System to Render

This guide explains how to deploy the TamkeenAI Career System to Render's cloud platform using a free tier.

## Prerequisites

1. A GitHub account with your TamkeenAI Career System repository
2. A Render account (sign up at [render.com](https://render.com))
3. MongoDB Atlas account with your cluster set up

## Deployment Steps

### 1. Configure your MongoDB Atlas Connection

- Ensure your MongoDB Atlas cluster is properly set up
- Make sure your IP whitelist allows connections from anywhere (0.0.0.0/0) 
- Keep your connection string handy: `mongodb+srv://loveanime200o0:R8tdEvgOvId5FEZv@tamkeen.0fmhury.mongodb.net/?retryWrites=true&w=majority&appName=Tamkeen`

### 2. Deploy to Render

#### Option A: Deploy with Blueprint (Recommended)

1. Log in to your Render dashboard
2. Click "New" and select "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and create all services
5. Configure environment variables:
   - MONGO_URI
   - OPENAI_API_KEY
   - DEEPSEEK_API_KEY
   - HF_TOKEN
6. Click "Apply" to start the deployment

#### Option B: Manual Setup

If you prefer to set up each service manually:

1. **Main API Service**:
   - Create a new Web Service in Render
   - Connect your GitHub repository
   - Set the build command: `pip install -r backend/requirements.txt && pip install gunicorn pymongo==4.12.0 pyjwt flask-jwt-extended huggingface_hub numpy==1.26.4 openai`
   - Set the start command: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
   - Add environment variables (especially MONGO_URI)

2. **Frontend Service**:
   - Create a new Static Site in Render
   - Connect your GitHub repository
   - Set the build command: `cd frontend && npm install && npm run build`
   - Set the publish directory: `frontend/dist`
   - Add the environment variables from `.env.production`

3. **Additional API Services**:
   - Repeat the process for the interview API and upload server with their specific commands

### 3. Verify Deployment

- Wait for all services to build and deploy (this may take a few minutes)
- Check each service's logs for any errors
- Visit your frontend URL to test the application
- Test connections to all backend APIs

## Troubleshooting

- **Build Failures**: Check the build logs for errors. Most common issues are related to dependencies or environment variables.
- **Connection Issues**: Ensure your MongoDB Atlas connection string is correct and that the IP is whitelisted.
- **Missing Environment Variables**: Double-check that all required environment variables are set in each service.
- **Cross-Origin Errors**: If you see CORS errors, check that your backend is properly configured to accept requests from your frontend domain.

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/2.0.x/deploying/) 