import { useEffect, useState } from 'react';

const API = 'http://localhost:4000/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API}/users`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const generateUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/users/generate`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to generate users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <section className="card">
        <span className="status">Step 5</span>
        <h1>Random User API + MySQL</h1>
        <p>Generate learner profiles, store them in MySQL, and display them in React.</p>
        <button onClick={generateUsers} disabled={loading}>
          {loading ? 'Generating...' : 'Generate 5 Users'}
        </button>
        {error && <p>{error}</p>}
      </section>

      <div className="grid" style={{ marginTop: 20 }}>
        {users.map((user) => (
          <article className="card user-card" key={user.id}>
            {user.avatarUrl && <img src={user.avatarUrl} alt={user.name} />}
            <h3>{user.name}</h3>
            <div className="muted">{user.email}</div>
            <small>{[user.city, user.country].filter(Boolean).join(', ')}</small>
          </article>
        ))}
      </div>
    </main>
  );
}
