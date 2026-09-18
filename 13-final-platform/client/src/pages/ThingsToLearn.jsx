import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowRight, BookOpenCheck, CheckCircle2, History, Map as MapIcon } from 'lucide-react';

export default function ThingsToLearn() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api.roadmaps().then(setRoadmaps).catch((err) => setError(err.message));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const roadmap of roadmaps) {
      if (!map.has(roadmap.topic)) map.set(roadmap.topic, []);
      map.get(roadmap.topic).push(roadmap);
    }
    return [...map.entries()];
  }, [roadmaps]);

  return <div className="page">
    <header className="page-head compact">
      <div>
        <span className="mini-label">PERSONALIZED LEARNING</span>
        <h1>Things to Learn</h1>
        <p>Every assessment creates a saved roadmap. Complete learning steps, revisit earlier versions, and reassess weak areas when you are ready.</p>
      </div>
    </header>

    {error && <div className="error-box">{error}</div>}

    {!grouped.length ? <div className="empty-state card">
      <MapIcon size={28}/><h3>No learning roadmap yet</h3><p>Complete an assessment and your personalized learning plan will appear here.</p>
      <button className="primary" onClick={() => nav('/topics')}>Start an assessment<ArrowRight size={17}/></button>
    </div> : <div className="learning-topic-grid">
      {grouped.map(([topic, versions]) => {
        const active = versions.find((item) => item.status === 'ACTIVE') || versions[0];
        return <section className="card learning-topic-card" key={topic}>
          <div className="learning-topic-head">
            <div className="roadmap-summary-icon"><BookOpenCheck size={22}/></div>
            <div><span className="mini-label">{versions.length} ROADMAP VERSION{versions.length === 1 ? '' : 'S'}</span><h3>{topic}</h3></div>
          </div>
          <div className="learning-score-row"><span>Latest assessment</span><strong>{active.score}%</strong></div>
          <div className="roadmap-progress-line"><i style={{ width: `${active.progress}%` }}/></div>
          <div className="learning-progress-copy"><span>{active.completedItems}/{active.totalItems} steps completed</span><b>{active.progress}%</b></div>
          <div className="learning-gaps">{active.gaps?.slice(0, 3).map((gap) => <span key={gap}>{gap}</span>)}</div>
          <button className="primary wide" onClick={() => nav(`/roadmap/${active.id}`)}>Continue roadmap<ArrowRight size={17}/></button>
          {versions.length > 1 && <details className="roadmap-history">
            <summary><History size={15}/>Previous roadmap versions</summary>
            <div>{versions.filter((v) => v.id !== active.id).map((version) => <button key={version.id} onClick={() => nav(`/roadmap/${version.id}`)}><span>Version {version.versionNo} · {new Date(version.createdAt).toLocaleDateString()}</span><b>{version.score}%</b></button>)}</div>
          </details>}
        </section>;
      })}
    </div>}
  </div>;
}
