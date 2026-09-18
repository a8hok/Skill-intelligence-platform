import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Trophy, LogOut, Sparkles, Map, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Layout({ children, user, onSignOut }) {
  const navigate = useNavigate();
  const signOut = () => {
    onSignOut();
    navigate('/login', { replace: true });
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div>
        <div className="brand"><div className="brand-mark"><Sparkles size={18}/></div><div><strong>Skill Intelligence</strong><span>Engineering learning</span></div></div>
        <nav>
          <NavLink to="/dashboard"><LayoutDashboard/>Dashboard</NavLink>
          <NavLink to="/topics"><BrainCircuit/>Assessments</NavLink>
          <NavLink to="/learning"><Map/>Things to Learn</NavLink>
          <NavLink to="/progress"><TrendingUp/>Progress</NavLink>
          <NavLink to="/ranking"><Trophy/>Ranking</NavLink>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="sidebar-avatar-wrap">
            <img
              className="sidebar-avatar"
              src={user?.avatarUrl || `${API_URL}/auth/avatar/${user?.id}`}
              alt={user?.name ? `${user.name} profile` : 'Student profile'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const proxy = `${API_URL}/auth/avatar/${user?.id}`;
                if (e.currentTarget.src !== proxy) e.currentTarget.src = proxy;
              }}
            />
          </div>
          <div><strong>{user?.name || 'Student'}</strong><span>{user?.email || ''}</span></div>
        </div>
        <button className="ghost signout-btn" onClick={signOut}><LogOut size={17}/>Sign out</button>
      </div>
    </aside>
    <main className="main-content">{children}</main>
  </div>;
}
