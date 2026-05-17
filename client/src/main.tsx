import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Add console filter for development
if (import.meta.env.DEV) {
  // Override console methods more comprehensively
  const originalError = console.error;
  const originalWarn = console.warn;
 
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (!message.includes('Feature Policy')) {
      originalError(...args);
    }
  };
 
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (!message.includes('Feature Policy')) {
      originalWarn(...args);
    }
  };
}

// // Frontend में server ready होने का wait करें
// const waitForServer = async (): Promise<boolean> => {
//   const maxAttempts = 30; // 30 seconds max wait
  
//   for (let i = 0; i < maxAttempts; i++) {
//     try {
//       const response = await fetch('http://localhost:3000/api/health');
//       const data = await response.json();
      
//       if (data.database?.connected) {
//         console.log('✅ Server and Database are ready!');
//         return true;
//       }
//     } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
//       console.log(`Waiting for server... (${i + 1}/${maxAttempts})`);
//     }
    
//     await new Promise(resolve => setTimeout(resolve, 1000));
//   }
  
//   return false;
// };

// // Loading screen function
// const showLoadingScreen = () => {
//   const root = document.getElementById('root')!;
//   root.innerHTML = `
//     <div style="
//       display: flex; 
//       justify-content: center; 
//       align-items: center; 
//       height: 100vh; 
//       flex-direction: column;
//       font-family: Arial, sans-serif;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       color: white;
//     ">
//       <div style="text-align: center;">
//         <div style="
//           border: 4px solid #f3f3f3;
//           border-top: 4px solid #3498db;
//           border-radius: 50%;
//           width: 50px;
//           height: 50px;
//           animation: spin 2s linear infinite;
//           margin: 0 auto 20px;
//         "></div>
//         <h2 style="margin: 10px 0;">🔄 Connecting to Server...</h2>
//         <p style="margin: 5px 0; opacity: 0.8;">Please wait while we establish connection with database...</p>
//         <p style="margin: 5px 0; font-size: 14px; opacity: 0.6;">This may take a few seconds</p>
//       </div>
//       <style>
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       </style>
//     </div>
//   `;
// };

// // Error screen function
// const showErrorScreen = (message: string) => {
//   const root = document.getElementById('root')!;
//   root.innerHTML = `
//     <div style="
//       display: flex; 
//       justify-content: center; 
//       align-items: center; 
//       height: 100vh; 
//       flex-direction: column;
//       font-family: Arial, sans-serif;
//       background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
//       color: white;
//       text-align: center;
//       padding: 20px;
//     ">
//       <div style="
//         background: rgba(255,255,255,0.1);
//         padding: 40px;
//         border-radius: 15px;
//         backdrop-filter: blur(10px);
//         max-width: 500px;
//       ">
//         <h2 style="margin: 0 0 20px 0; font-size: 24px;">⚠️ Connection Failed</h2>
//         <p style="margin: 10px 0; font-size: 16px; line-height: 1.5;">${message}</p>
//         <div style="margin-top: 30px;">
//           <button onclick="location.reload()" style="
//             background: #fff;
//             color: #ee5a24;
//             border: none;
//             padding: 12px 30px;
//             border-radius: 25px;
//             font-size: 16px;
//             font-weight: bold;
//             cursor: pointer;
//             transition: all 0.3s ease;
//           " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
//             🔄 Retry Connection
//           </button>
//         </div>
//         <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
//           Make sure your backend server is running on port 3000
//         </p>
//       </div>
//     </div>
//   `;
// };

// // App start करने से पहले server health check
// const startApp = async () => {
//   console.log('🚀 Starting Frontend Application...');
//   console.log('🔄 Checking server and database status...');
  
//   // Show loading screen
//   showLoadingScreen();
  
//   try {
//     const ready = await waitForServer();
    
//     if (ready) {
//       console.log('🎉 Server and Database are ready! Starting React App...');
      
//       // Start React App
//       createRoot(document.getElementById('root')!).render(
//         <StrictMode>
//           <App />
//         </StrictMode>,
//       );
//     } else {
//       console.error('❌ Server not ready after 30 seconds');
//       showErrorScreen(
//         'Unable to connect to server after 30 seconds. Please ensure the backend server is running and try again.'
//       );
//     }
//   } catch (error) {
//     console.error('❌ Failed to check server status:', error);
//     showErrorScreen(
//       'Failed to establish connection with the server. Please check your network connection and try again.'
//     );
//   }
// };

// // Start the application
// startApp();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Normal React app start (without server wait)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)