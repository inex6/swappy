import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div className="h-screen flex justify-center items-center">
      <h1 className="text-3xl font-bold text-blue-600">
        123dd
      </h1>
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
