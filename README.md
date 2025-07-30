# DeskRex AI - Secure Code Execution Sandbox

A secure, isolated Next.js-based environment for executing user-generated code in the DeskRex AI platform. This sandbox provides safe execution of React, HTML, and JavaScript code while maintaining complete security isolation from the main application.

## 🎯 Overview

This project implements a secure code execution environment that replaces the previous Cloudflare Workers-based solution with a more stable and secure Render.com + postMessage architecture. The sandbox ensures complete domain separation and follows a multi-layered security approach to prevent malicious code execution.

## 🏗️ Architecture

### System Design

```
┌─────────────────────┐    postMessage    ┌──────────────────────┐
│   Main Application  │ ────────────────► │  Render Sandbox      │
│ (app.deskrex.com)   │                   │(sandbox.deskrex.com) │
│                     │                   │                      │
│ ┌─────────────────┐ │                   │ ┌──────────────────┐ │
│ │ ArtifactView    │ │ ◄─────────────── │ │ Next.js Runner   │ │
│ │   - iframe mgmt │ │    execution      │ │   - dynamic exec  │ │
│ │   - code sending│ │    results        │ │   - react env     │ │
│ └─────────────────┘ │                   │ └──────────────────┘ │
└─────────────────────┘                   └──────────────────────┘
```

### Security Isolation

- **Complete Domain Separation**: `sandbox.deskrex.com` vs `app.deskrex.com`
- **Sandboxed iframe**: `allow-scripts` only (no `allow-same-origin`)
- **Origin Verification**: All postMessage communications verify sender origin
- **CSP Headers**: Content Security Policy prevents unauthorized access

## 🛡️ Security Features

### Multi-Layer Protection

1. **Domain Isolation**: Complete separation prevents access to main app cookies/localStorage
2. **iframe Sandbox**: Restrictive permissions block dangerous DOM operations
3. **postMessage Protocol**: Structured, origin-verified communication only
4. **Content Sanitization**: Input validation and code type detection

### Threat Prevention

The following malicious operations are **completely blocked**:

```javascript
// ❌ All of these are prevented by domain separation
document.cookie                           // undefined
localStorage.getItem('token')             // null  
fetch('/api/user', {credentials: 'include'})  // CORS error
window.parent.location.href               // SecurityError
```

## 💻 Technical Implementation

### Environment URLs

- **Development**: `http://localhost:3001/runner`
- **Production**: `https://sandbox.deskrex.com/runner`

### Communication Protocol

The sandbox uses a structured postMessage protocol for secure communication:

```typescript
interface CodeExecutionMessage {
  type: 'EXECUTE_CODE' | 'EXECUTION_RESULT' | 'SANDBOX_READY';
  executionId: string;
  payload: {
    code?: string;
    codeType?: 'html' | 'react' | 'javascript';
    result?: string;
    error?: string;
    timestamp: number;
  };
}
```

### Supported Code Types

- **React Components**: JSX with hooks and modern React features
- **HTML**: Complete HTML documents with styling and scripts
- **JavaScript**: General JavaScript execution with DOM manipulation
- **SVG**: Scalable Vector Graphics rendering

## 🚀 Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone and navigate to sandbox
cd js-sandbox

# Install dependencies
npm install

# Start development server
npm run dev
```

The sandbox will be available at `http://localhost:3001`

### Development URLs

- **Runner Page**: `http://localhost:3001/runner`
- **Health Check**: `http://localhost:3001/api/health`

## 📂 Project Structure

```
js-sandbox/
├── src/
│   ├── components/
│   │   └── DynamicCodeExecutor.tsx    # Dynamic component execution
│   ├── pages/
│   │   ├── _app.tsx                   # Next.js app wrapper
│   │   ├── _document.tsx              # HTML document structure
│   │   ├── index.tsx                  # Landing page
│   │   └── runner.tsx                 # Main execution environment
│   └── styles/
│       └── globals.css                # Global styles
├── package.json                       # Dependencies and scripts
├── next.config.js                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
└── tailwind.config.js                 # Tailwind CSS configuration
```

## 🔧 Configuration

### Environment Variables

```env
# Development/Production mode
NODE_ENV=development|production

# Optional: Custom port (defaults to 3001)
PORT=3001
```

### Deployment (Render.com)

The sandbox is designed for deployment on Render.com with the following configuration:

```yaml
# render.yaml
services:
  - type: web
    name: deskrex-sandbox
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## 🛠️ API Endpoints

### `/runner`
Main execution environment page that handles code execution requests via postMessage.

### `/api/health`
Health check endpoint for monitoring and uptime services.

## 🔒 Security Considerations

### Origin Verification

All postMessage communications include strict origin verification:

```typescript
const allowedOrigins = [
  'http://localhost:3000',        // Development main app
  'https://app.deskrex.com'       // Production main app
];

if (!allowedOrigins.includes(event.origin)) {
  console.warn('🚨 Security: Untrusted origin blocked:', event.origin);
  return;
}
```

### Execution Isolation

- Each code execution gets a unique execution ID
- Results are matched to specific execution requests
- Failed executions are isolated and don't affect the sandbox

## 📊 Performance

### Metrics

- **Initial Load Time**: < 3 seconds
- **Code Execution**: < 2 seconds for typical React components
- **Error Rate**: < 5% (vs 30%+ with previous Cloudflare solution)

### Optimization

- Lazy loading of execution components
- Efficient postMessage batching
- Automatic cleanup of execution contexts

## 🚨 Troubleshooting

### Common Issues

1. **Sandbox Not Loading**
   - Check if the sandbox URL is accessible
   - Verify CORS settings for the main domain
   - Ensure proper network connectivity

2. **Code Execution Timeout**
   - Check for infinite loops in user code
   - Verify postMessage communication is working
   - Look for JavaScript errors in browser console

3. **Development Server Issues**
   - Ensure port 3001 is available
   - Check for dependency installation errors
   - Verify Node.js version compatibility

### Debug Mode

Enable debug information in development by setting:

```javascript
const DEBUG_MODE = process.env.NODE_ENV === 'development';
```

## 🔄 Migration from Cloudflare Workers

This sandbox replaces the previous Cloudflare Workers implementation with significant improvements:

### Before (Cloudflare Workers)
- ❌ Complex import/export parsing
- ❌ Frequent "Unexpected token 'default'" errors
- ❌ Manual string replacement processing
- ❌ Same-origin security vulnerabilities

### After (Render.com Sandbox)
- ✅ Native Next.js dynamic imports
- ✅ Robust error handling
- ✅ Complete domain separation
- ✅ Professional postMessage protocol

## 📈 Future Roadmap

- [ ] Enhanced code validation and sanitization
- [ ] Support for additional programming languages
- [ ] Real-time collaboration features
- [ ] Advanced debugging capabilities
- [ ] Performance monitoring and analytics

## 🤝 Contributing

1. Follow existing code patterns and TypeScript conventions
2. Ensure all security measures are maintained
3. Test thoroughly in both development and production environments
4. Update documentation for any new features

## 📚 Related Documentation

- [ADR 0004: HTML Code Execution Sandbox](../app/docs/adr/0004-html-code-execution-sandbox.md)
- [Secure Code Execution Render Solution](../app/docs/architecture/secure-code-execution-render-solution.md)
- [Code Execution Alternatives Research](../app/docs/research/code-execution-alternatives-research-result.md)

## 📄 License

Part of the DeskRex AI platform. All rights reserved.

---

**Last Updated**: 2025-07-30  
**Maintainer**: DeskRex AI Development Team  
**Security Review**: Required for all changes