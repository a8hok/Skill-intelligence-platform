import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, CheckCircle2, Map } from 'lucide-react';

export default function Roadmap() {
  const nav = useNavigate();
  const { id } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.roadmap(id).then(setRoadmap).catch((err) => setError(err.message));
  }, [id]);

  const toggle = async (item) => {
    const next = !item.completed;
    setRoadmap((current) => ({ ...current, items: current.items.map((x) => x.id === item.id ? { ...x, completed: next } : x) }));
    try {
      await api.updateRoadmapItem(item.id, next);
    } catch (err) {
      setRoadmap((current) => ({ ...current, items: current.items.map((x) => x.id === item.id ? { ...x, completed: !next } : x) }));
      setError(err.message);
    }
  };

  if (error && !roadmap) return <div className="page"><div className="empty-state card"><p>{error}</p><button className="primary" onClick={() => nav('/learning')}>Back to learning</button></div></div>;
  if (!roadmap) return <div className="page"><div className="skeleton hero-skeleton"/></div>;

  const complete = roadmap.items.filter((item) => item.completed).length;
  const percent = roadmap.items.length ? Math.round((complete / roadmap.items.length) * 100) : 0;

  return <div className="page roadmap-page">
    <header className="page-head compact">
      <div><span className="mini-label">PERSONALIZED ROADMAP · VERSION {roadmap.versionNo}</span><h1>{roadmap.topic} learning roadmap</h1><p>Complete each learning step, then take a targeted reassessment based on anything that remains unfinished.</p></div>
      <button className="ghost roadmap-back" onClick={() => nav('/learning')}><ArrowLeft size={17}/> Things to Learn</button>
    </header>

    {error && <div className="error-box">{error}</div>}
    <section className="roadmap-summary card">
      <div className="roadmap-summary-icon"><Map size={24}/></div>
      <div className="roadmap-summary-copy"><span className="mini-label">ASSESSMENT SCORE</span><h2>{roadmap.score}%</h2><p>{roadmap.summary}</p><div className="roadmap-progress-line"><i style={{ width: `${percent}%` }}/></div><small>{complete}/{roadmap.items.length} steps completed · {percent}%</small></div>
    </section>

    <section className="roadmap-layout">
      <div className="card roadmap-main">
        <div className="section-title"><div><span className="mini-label">YOUR PLAN</span><h3>Things to learn</h3></div><BookOpenCheck/></div>
        <div className="roadmap-checklist">
          {roadmap.items.map((step, index) => <button className={`roadmap-check-item ${step.completed ? 'done' : ''}`} key={step.id} onClick={() => toggle(step)}>
            <span className="roadmap-check-box">{step.completed ? <Check size={17}/> : index + 1}</span>
            <div><strong>{step.title}</strong><p>{step.description}</p>{step.concept && <small>{step.concept}</small>}</div>
          </button>)}
        </div>
      </div>

      <aside className="card roadmap-focus">
        <span className="mini-label">FOCUS AREAS</span><h3>Concepts to improve</h3>
        <div className="roadmap-focus-list">{roadmap.gaps?.length ? roadmap.gaps.map((gap) => <div key={gap}><CheckCircle2 size={15}/><span>{gap}</span></div>) : <p>No major gaps were identified. Continue with deeper practice.</p>}</div>
        <hr/>
        <span className="mini-label">ROADMAP STATUS</span><p>{roadmap.status === 'ACTIVE' ? 'This is your current roadmap for this topic.' : 'This is a previous roadmap version retained for learning history.'}</p>
      </aside>
    </section>

    <div className="bottom-cta"><div><h3>Ready to measure your progress?</h3><p>The next assessment prioritizes incomplete roadmap concepts.</p></div><button className="primary" onClick={() => nav(`/quiz/${encodeURIComponent(roadmap.topic)}?mode=${roadmap.sourceMode || 'gemini'}&roadmapId=${roadmap.id}`)}>Targeted reassessment<ArrowRight size={18}/></button></div>
  </div>;
}
