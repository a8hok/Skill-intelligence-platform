import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ProgressRing from '../components/ProgressRing';
import { ArrowRight, Target, TrendingUp, Award, Map, BookOpenCheck, Sparkles } from 'lucide-react';

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const nav = useNavigate();
  useEffect(() => { api.dashboard().then(setData).catch(() => setData({ overall: 0, attempts: [], skills: [], roadmapProgress: {} })); }, []);
  if (!data) return <div className="page"><div className="skeleton hero-skeleton"/></div>;

  return <div className="page">
    <header className="page-head"><div><span className="mini-label">YOUR LEARNING SPACE</span><h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}.</h1><p>Assess your skills, complete personalized learning roadmaps, and track improvement over time.</p></div><button className="primary" onClick={() => nav('/topics')}>Start assessment<ArrowRight size={18}/></button></header>

    <section className="dashboard-grid enhanced-dashboard-grid">
      <div className="card score-card"><div><span className="mini-label">OVERALL READINESS</span><h2>{data.overall >= 80 ? 'Strong progress' : data.overall >= 60 ? 'Building confidence' : 'Ready to grow'}</h2><p>Latest score across every topic you have assessed.</p></div><ProgressRing value={data.overall}/></div>
      <div className="metric card"><Target/><div><span>Topics assessed</span><strong>{data.topicsCompleted}/{data.totalTopics}</strong></div></div>
      <div className="metric card"><TrendingUp/><div><span>Latest score</span><strong>{data.latestScore || 0}%</strong></div></div>
      <div className="metric card"><Award/><div><span>Current rank</span><strong>#{data.rank || '—'}</strong></div></div>
      <div className="metric card"><BookOpenCheck/><div><span>Roadmap progress</span><strong>{data.roadmapProgress?.percent || 0}%</strong></div></div>
      <div className="metric card"><TrendingUp/><div><span>Overall improvement</span><strong>{data.overallImprovement > 0 ? '+' : ''}{data.overallImprovement || 0}%</strong></div></div>
    </section>

    {data.recommendedNextTopic && <section className="card dashboard-recommendation"><div><Sparkles/><div><span className="mini-label">RECOMMENDED NEXT</span><h3>{data.recommendedNextTopic}</h3><p>{data.skills.find((x) => x.topic === data.recommendedNextTopic)?.level === 'Not Started' ? 'Build a baseline for this topic.' : 'This is currently one of your best opportunities for improvement.'}</p></div></div><button className="secondary-action" onClick={() => nav(`/quiz/${encodeURIComponent(data.recommendedNextTopic)}?mode=gemini`)}>Start<ArrowRight size={16}/></button></section>}

    <section className="three-col-summary">
      <div className="card topic-highlight"><span className="mini-label">STRONGEST TOPIC</span><h3>{data.strongestTopic?.topic || '—'}</h3><strong>{data.strongestTopic ? `${data.strongestTopic.score}%` : 'Take an assessment'}</strong></div>
      <div className="card topic-highlight"><span className="mini-label">FOCUS TOPIC</span><h3>{data.weakestTopic?.topic || '—'}</h3><strong>{data.weakestTopic ? `${data.weakestTopic.score}%` : 'Take an assessment'}</strong></div>
      <div className="card topic-highlight"><span className="mini-label">BEST SCORE</span><h3>Personal best</h3><strong>{data.bestScore || 0}%</strong></div>
    </section>

    <section className="two-col">
      <div className="card"><div className="section-title"><div><span className="mini-label">SKILL SNAPSHOT</span><h3>Your topic performance</h3></div><button className="ghost" onClick={() => nav('/progress')}>View progress</button></div><div className="skill-list">{data.skills.map((s) => <div className="skill-row" key={s.topic}><div><strong>{s.topic}</strong><span>{s.level}</span></div><div className="bar"><i style={{ width: `${s.score}%` }}/></div><b>{s.attempts ? `${s.score}%` : '—'}</b></div>)}</div></div>
      <div className="card"><div className="section-title"><div><span className="mini-label">RECENT ACTIVITY</span><h3>Assessment history</h3></div><Map size={18}/></div><div className="attempt-list">{data.attempts.length ? data.attempts.slice(0, 5).map((a) => <button className="attempt attempt-button" key={a.id} onClick={() => nav(`/results/${a.id}`)}><div><strong>{a.topic}</strong><span>{new Date(a.created_at).toLocaleDateString()}</span></div><b className={a.score >= 70 ? 'good' : 'warn'}>{a.score}%</b></button>) : <div className="empty-state">No assessments yet. Choose a topic to get started.</div>}</div></div>
    </section>
  </div>;
}
