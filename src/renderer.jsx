import './index.css';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [screenshotSrc, setScreenshotSrc] = useState(null);
  const [error, setError] = useState(null);

  const handleTakeScreenshot = async () => {
    try {
      setError(null); // Reset error state
      const filePath = await window.electronAPI.takeScreenshot();
      if (filePath) {
        const imageBase64 = await window.electronAPI.getImageAsBase64(filePath);
        setScreenshotSrc(imageBase64);
      }
    } catch (err) {
      console.error('An error occurred:', err);
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-8">
      {screenshotSrc ? (
        <img src={screenshotSrc} alt="Screenshot" className="max-w-full max-h-full object-contain" />
      ) : (
        <div className="text-center">
          <button
            onClick={handleTakeScreenshot}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-bold transition-colors disabled:bg-gray-500"
          >
            Take Screenshot
          </button>
          {error && (
            <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
              <h3 className="font-bold">Error:</h3>
              <pre className="mt-2 text-left text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
rootElement.innerHTML = '';
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

