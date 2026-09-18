import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRight, Sparkles, UserPlus, Users } from 'lucide-react';

export default function Login({ onAuth }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selecting, setSelecting] = useState(null);
  const nav = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.users();
      setUsers(data.users || []);
      setWarning(data.warning || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateUsers = async () => {
    setGenerating(true);
    setError('');
    try {
      const data = await api.generateUsers();
      const generated = data.users || [];
      setUsers((current) => [...current, ...generated]);
      setWarning(data.warning || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const chooseUser = async (user) => {
    setSelecting(user.id);
    setError('');
    try {
      const data = await api.selectUser(user.id);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
      nav('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className="auth-page random-login-page">
      <div className="random-login-shell">
        <header className="random-login-head">
          <div>
            <div className="eyebrow"><Sparkles size={15}/> AI-assisted engineering learning</div>
            <h1>Select a learner profile</h1>
            <p>The first five learners are stored in MySQL and remain the same on every refresh. Generate five more learners whenever you want to expand the list.</p>
          </div>
          <div className="profile-page-actions">
            <button className="refresh-users" onClick={generateUsers} disabled={loading || generating}>
              <UserPlus size={16}/>{generating ? 'Generating...' : 'Generate 5 users'}
            </button>
          </div>
        </header>

        <div className="profile-page-label">Showing {users.length} learner profile{users.length === 1 ? '' : 's'}</div>
        {warning && <div className="warning-box">{warning}</div>}
        {error && <div className="error-box">{error}</div>}

        {loading ? (
          <div className="profile-loading card"><Users size={20}/> Loading learner profiles...</div>
        ) : (
          <section className="profile-grid">
            {users.map((user) => (
              <article className="profile-card" key={user.id}>
                <img
                  className="profile-photo"
                  src={user.avatarUrl || `${API_URL}/auth/avatar/${user.id}`}
                  alt={`${user.name} profile`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const proxy = `${API_URL}/auth/avatar/${user.id}`;
                    if (e.currentTarget.src !== proxy) e.currentTarget.src = proxy;
                  }}
                />
                <div className="profile-card-copy">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                  <small>{[user.city, user.country].filter(Boolean).join(', ') || 'Engineering learner'}</small>
                </div>
                <button onClick={() => chooseUser(user)} disabled={selecting === user.id}>
                  {selecting === user.id ? 'Opening...' : 'Continue'} <ArrowRight size={16}/>
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
