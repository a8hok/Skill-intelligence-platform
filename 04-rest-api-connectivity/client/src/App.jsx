import { useEffect, useState } from 'react';

export default function App() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/topics')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load topics');
        return res.json();
      })
      .then((data) => setTopics(data.topics || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="container">
      <section className="card">
        <span className="status">Step 4</span>
        <h1>React → REST API → Express</h1>
        <p>The browser now fetches data from the backend.</p>
        {error && <p>{error}</p>}
        <div className="grid">
          {topics.map((topic) => (
            <div className="card" key={topic}><strong>{topic}</strong></div>
          ))}
        </div>
      </section>
    </main>
  );
}
