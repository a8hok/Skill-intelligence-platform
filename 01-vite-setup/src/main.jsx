import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

function App() {
  return (
    <main className="container">
      <section className="card">
        <span className="status">Step 1</span>
        <h1>AI Engineering Skill Intelligence Platform</h1>
        <p>Our React + Vite frontend is running successfully.</p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
