import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Ranking from './pages/Ranking';
import Roadmap from './pages/Roadmap';
import ThingsToLearn from './pages/ThingsToLearn';
import Progress from './pages/Progress';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleAuth = (selectedUser) => setUser(selectedUser);
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <Routes><Route path="/login" element={<Login onAuth={handleAuth}/>}/><Route path="*" element={<Navigate to="/login" replace/>}/></Routes>;

  return <Layout user={user} onSignOut={handleSignOut}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard user={user}/>}/>
      <Route path="/topics" element={<Topics/>}/>
      <Route path="/quiz/:topic" element={<Quiz/>}/>
      <Route path="/results" element={<Results/>}/>
      <Route path="/results/:attemptId" element={<Results/>}/>
      <Route path="/learning" element={<ThingsToLearn/>}/>
      <Route path="/roadmap/:id" element={<Roadmap/>}/>
      <Route path="/progress" element={<Progress/>}/>
      <Route path="/ranking" element={<Ranking user={user}/>}/>
      <Route path="/login" element={<Navigate to="/dashboard" replace/>}/>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  </Layout>;
}
