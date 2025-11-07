// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PreimonCartProvider } from './context/PreimonCartContext'; // 👈 Agrega esta línea

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <PreimonCartProvider> {/* 👈 Envuelve <App /> */}
      <App />
    </PreimonCartProvider>
  </React.StrictMode>
);

reportWebVitals();