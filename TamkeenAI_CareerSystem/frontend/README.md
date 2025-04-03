# TamkeenAI Frontend

This is the frontend application for the TamkeenAI Career System.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
3. The application will be available at `http://localhost:3000`

## AI-Powered Emotion Detection

The application includes advanced emotion detection powered by face-api.js (TensorFlow.js), which analyzes users' facial expressions in real-time during interviews and assessments.

### Features

- **Client-Side Processing**: All emotion detection runs locally in the browser for enhanced privacy and reduced latency
- **Multiple Fallback Mechanisms**: Uses a progressive enhancement approach that falls back to server API or mock data if needed
- **High Accuracy**: Leverages TensorFlow.js models trained on diverse facial datasets
- **Adaptive Performance**: Automatically adjusts video quality based on device capabilities

### Setup Instructions

1. Models are downloaded automatically to `/public/models` directory
2. Camera permissions must be granted for emotion detection to function
3. The system can detect 7 emotions: happy, sad, angry, surprised, fearful, disgusted, and neutral

### Usage in Components

Use the EmotionDetector component in your React components:

```jsx
import EmotionDetector from '../EmotionDetection/EmotionDetector';

// In your component:
<EmotionDetector 
  onEmotionDetected={handleEmotions} 
  size="normal"  // Options: "small", "normal", "large"
  showVideo={true}  // Whether to display the video feed
/>
```

The component will handle camera permission requests and automatically load the required ML models.

## CORS Proxy Configuration

If you encounter CORS errors when connecting to the backend API, use one of the following solutions:

### Option 1: Use Vite's Built-in Proxy (Recommended)

The project has a built-in proxy configuration in `vite.config.js` that forwards requests from `/api` to the backend server. This should work automatically when you run:

```bash
npm run dev
```

### Option 2: Run Express CORS Proxy Server

For cases where the built-in proxy doesn't resolve CORS issues:

1. Start the Express proxy server:
   ```bash
   npm run express-proxy
   ```

2. The proxy server will run on port 8000
3. Update your API client to use `http://localhost:8000/api/...` instead of direct backend calls

### Option 3: Run with Combined Servers

To run both the frontend development server and CORS proxy together:

```bash
npm run dev-with-proxy
```

## Troubleshooting

### CORS Errors

If you see errors like:
```
Access to XMLHttpRequest at 'http://localhost:5001/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

1. Make sure the backend server is running at http://localhost:5001
2. Ensure one of the proxy servers is running properly
3. Check that API calls are being routed through the proxy

### Camera Access Issues

If emotion detection is not working:

1. Check that camera permissions are granted in your browser
2. Ensure you're using a browser that supports WebRTC (Chrome, Firefox, Safari, Edge)
3. If using face-api.js fails, the system will fall back to server-side detection or mock data

### ES Module vs CommonJS Issues

If you encounter errors mentioning "require is not defined in ES module scope":

This project uses ES Modules (type: "module" in package.json). All `.js` files must use `import` instead of `require`.

To fix script files:
1. Use ES module syntax (import/export)
2. Or rename files to use `.cjs` extension for CommonJS modules 