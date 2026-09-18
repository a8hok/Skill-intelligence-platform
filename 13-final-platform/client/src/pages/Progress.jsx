import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRight, CheckCircle2, Clock3, Sparkles, TrendingUp } from 'lucide-react';

export default function Progress() {
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    Promise.all([api.progress(), api.assessmentHistory()])
      .then(([p, h]) => { setProgress(p); setHistory(h); })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="page"><div className="error-box">{error}</div></div>;
  if (!progress) return <div className="page"><div className="skeleton hero-skeleton"/></div>;

  return <div className="page">
    <header className="page-head compact"><div><span className="mini-label">LEARNING PROGRESS</span><h1>Track your skill growth.</h1><p>See score history, topic status, roadmap completion, and every assessment you have taken.</p></div></header>

    {progress.recommendedNextTopic && <section className="card recommendation-card">
      <div><Sparkles size={20}/><div><span className="mini-label">RECOMMENDED NEXT TOPIC</span><h3>{progress.recommendedNextTopic.topic}</h3><p>{progress.recommendedNextTopic.reason}</p></div></div>
      <button className="primary" onClick={() => nav(`/quiz/${encodeURIComponent(progress.recommendedNextTopic.topic)}?mode=gemini`)}>Assess topic<ArrowRight size={17}/></button>
    </section>}

    <section className="card progress-roadmap-summary"><div><CheckCircle2/><span>Roadmap progress</span></div><strong>{progress.roadmapProgress.percent}%</strong><div className="roadmap-progress-line"><i style={{ width: `${progress.roadmapProgress.percent}%` }}/></div><small>{progress.roadmapProgress.completedItems} of {progress.roadmapProgress.totalItems} active roadmap steps completed</small></section>

    <section className="progress-topic-grid">
      {progress.topics.map((item) => <article className="card progress-topic-card" key={item.topic}>
        <div className="progress-topic-title"><div><span className={`topic-status status-${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span><h3>{item.topic}</h3></div><strong>{item.latestScore === null ? '—' : `${item.latestScore}%`}</strong></div>
        <div className="score-history">
          {item.history.length ? item.history.map((point, index) => <div className="score-point" key={point.id}><span style={{ height: `${Math.max(8, point.score)}%` }}/><small>{point.score}</small><i>{index + 1}</i></div>) : <div className="no-history">No attempts yet</div>}
        </div>
        <footer><span>{item.attempts} attempt{item.attempts === 1 ? '' : 's'}</span><b className={item.improvement > 0 ? 'positive' : item.improvement < 0 ? 'negative' : ''}>{item.improvement > 0 ? '+' : ''}{item.improvement}% from first</b></footer>
      </article>)}
    </section>

    <section className="card assessment-history-card">
      <div className="section-title"><div><span className="mini-label">ASSESSMENT HISTORY</span><h3>Review previous attempts</h3></div><Clock3/></div>
      <div className="history-list">
        {history.length ? history.map((attempt) => <button key={attempt.id} onClick={() => nav(`/results/${attempt.id}`)}>
          <div><strong>{attempt.topic}</strong><span>{new Date(attempt.createdAt).toLocaleString()} · {attempt.generatedBy}</span></div>
          <div><b>{attempt.score}%</b><ArrowRight size={16}/></div>
        </button>) : <div className="empty-state">No assessments yet.</div>}
      </div>
    </section>
  </div>;
}
