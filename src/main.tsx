
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'

// Add Content Security Policy meta tag for improved security
const cspMetaTag = document.createElement('meta');
cspMetaTag.httpEquiv = 'Content-Security-Policy';
cspMetaTag.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'self';";
document.head.appendChild(cspMetaTag);

// Add X-Content-Type-Options meta tag
const xContentTypeOptionsMetaTag = document.createElement('meta');
xContentTypeOptionsMetaTag.httpEquiv = 'X-Content-Type-Options';
xContentTypeOptionsMetaTag.content = 'nosniff';
document.head.appendChild(xContentTypeOptionsMetaTag);

// Add X-Frame-Options meta tag
const xFrameOptionsMetaTag = document.createElement('meta');
xFrameOptionsMetaTag.httpEquiv = 'X-Frame-Options';
xFrameOptionsMetaTag.content = 'SAMEORIGIN';
document.head.appendChild(xFrameOptionsMetaTag);

// Add Referrer-Policy meta tag
const referrerPolicyMetaTag = document.createElement('meta');
referrerPolicyMetaTag.name = 'referrer';
referrerPolicyMetaTag.content = 'strict-origin-when-cross-origin';
document.head.appendChild(referrerPolicyMetaTag);

// Add custom CSS for toast notifications
const styleTag = document.createElement('style');
styleTag.textContent = `
  .welcome-toast {
    font-weight: 500;
    animation: slide-in-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both !important;
  }
  
  @keyframes slide-in-top {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(styleTag);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
