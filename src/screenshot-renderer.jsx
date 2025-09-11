import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import ScreenShot from './ScreenShot';

const rootElement = document.getElementById('root');
rootElement.innerHTML = '';
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ScreenShot />
  </React.StrictMode>
);
