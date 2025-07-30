# Render.com Deployment Guide

This guide explains how to deploy the DeskRex AI Secure Code Execution Sandbox to Render.com.

## 🚀 Quick Deployment Steps

### 1. Access Render.com Dashboard

1. Go to [https://render.com](https://render.com)
2. Sign in with your GitHub account
3. Click "New +" → "Web Service"

### 2. Connect GitHub Repository

1. Select "Build and deploy from a Git repository"
2. Connect your GitHub account if not already connected
3. Search for and select `deskrex-js-sandbox` repository
4. Click "Connect"

### 3. Configure Web Service

Fill in the following configuration:

**Basic Settings:**
- **Name**: `deskrex-sandbox` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch**: `main`

**Build & Deploy Settings:**
- **Build Command**: `npm install && npm run build`  
- **Start Command**: `npm start`
- **Root Directory**: ` ` (leave empty)

**Instance Type:**
- **Free Tier**: Select "Free" for testing
- **Production**: Select "Starter" ($7/month) or higher for production use

### 4. Environment Variables

No environment variables are required for basic functionality.

Optional environment variables:
```env
NODE_ENV=production
PORT=10000
```

### 5. Deploy

1. Click "Create Web Service"
2. Wait for the build and deployment process (usually 3-5 minutes)
3. Once deployed, your service will be available at: `https://your-service-name.onrender.com`

## 🔧 Custom Domain Setup (Optional)

### 1. Add Custom Domain

1. In your Render service dashboard, go to "Settings" → "Custom Domains"
2. Click "Add Custom Domain"
3. Enter your domain: `sandbox.deskrex.com`
4. Add the provided CNAME record to your DNS:
   ```
   Type: CNAME
   Name: sandbox (or your subdomain)
   Value: your-service-name.onrender.com
   ```

### 2. SSL Certificate

Render automatically provisions SSL certificates for custom domains via Let's Encrypt.

## 🔒 Security Configuration

### 1. Update CORS Origins

In your main application (`/app/src/app/_components/chat/visual-generation/SecureCodePreview.tsx`), update the allowed origins:

```typescript
const allowedOrigins = [
  'http://localhost:3000',        // Development
  'https://app.deskrex.com',      // Production main app
  'https://sandbox.deskrex.com'   // Production sandbox
];
```

### 2. Update Sandbox URL

In the same file, update the `SANDBOX_URL`:

```typescript
const SANDBOX_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/runner'  
  : 'https://sandbox.deskrex.com/runner';  // Your custom domain
```

## 📊 Monitoring & Health Checks

### 1. Health Check Endpoint

The sandbox includes a health check endpoint at `/api/health` that Render uses for monitoring.

### 2. Keep Service Active (Anti-Sleep)

For free tier services, use UptimeRobot or similar to ping your service every 5 minutes:

**UptimeRobot Configuration:**
- Monitor Type: HTTP(s)
- URL: `https://your-service-name.onrender.com/api/health`
- Monitoring Interval: 5 minutes

### 3. Logs

View application logs in Render dashboard under "Logs" tab.

## 🔄 Automatic Deployments

Render automatically deploys when you push to the connected branch (main).

To trigger a manual deployment:
1. Go to your service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## 🚨 Troubleshooting

### Build Failures

1. **Node.js Version**: Ensure using Node.js 18+ by adding to `package.json`:
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Memory Issues**: Upgrade to Starter plan if builds fail due to memory limits.

### Runtime Issues

1. **Check Logs**: Always check the Render service logs first
2. **Health Check**: Verify `/api/health` endpoint responds correctly
3. **CORS Issues**: Ensure origins are properly configured in both applications

### Performance Issues

1. **Cold Starts**: Free tier services sleep after 15 minutes of inactivity
2. **Solution**: Upgrade to paid plan or use UptimeRobot to keep service active

## 📱 Testing Deployment

### 1. Direct Access

Visit your deployed sandbox:
- Main page: `https://your-service-name.onrender.com`
- Runner: `https://your-service-name.onrender.com/runner`
- Health: `https://your-service-name.onrender.com/api/health`

### 2. Integration Testing

Test with your main application to ensure postMessage communication works correctly.

## 🎯 Production Checklist

- [ ] Service deployed successfully
- [ ] Custom domain configured (if applicable)  
- [ ] SSL certificate active
- [ ] Health check responding
- [ ] Origins updated in main application
- [ ] Integration tested
- [ ] Monitoring configured
- [ ] Auto-deploy working

## 💰 Cost Estimation

- **Free Tier**: $0/month (with sleep limitations)
- **Starter**: $7/month (no sleep, better performance)
- **Standard**: $25/month (high availability, more resources)

## 📞 Support

- **Render Documentation**: [https://render.com/docs](https://render.com/docs)
- **GitHub Issues**: Report issues in the repository
- **DeskRex AI Support**: Contact your development team

---

**Last Updated**: 2025-07-30  
**Environment**: Production Ready  
**Security Level**: High