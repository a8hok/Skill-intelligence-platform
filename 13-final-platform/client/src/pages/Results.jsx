import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import ProgressRing from '../components/ProgressRing';
import { ArrowRight, BookOpenCheck, Map, MessageCircleQuestion, RotateCcw, Check, X, Sparkles } from 'lucide-react';

export default function Results() {
  const nav = useNavigate();
  const { attemptId } = useParams();
  const [result, setResult] = useState(() => attemptId ? null : JSON.parse(sessionStorage.getItem('latestResult') || 'null'));
  const [loadError, setLoadError] = useState('');
  const [open, setOpen] = useState(null);
  const [mentor, setMentor] = useState({});
  const [mentorError, setMentorError] = useState({});

  useEffect(() => {
    if (!attemptId) return;
    api.assessmentAttempt(attemptId).then(setResult).catch((err) => setLoadError(err.message));
  }, [attemptId]);

  if (loadError) return <div className="page"><div className="empty-state card"><p>{loadError}</p><button className="primary" onClick={() => nav('/progress')}>Back to progress</button></div></div>;
  if (attemptId && !result) return <div className="page"><div className="skeleton hero-skeleton"/></div>;
  if (!result) return <div className="page"><div className="empty-state card">No recent result found. <button className="text-btn" onClick={() => nav('/topics')}>Choose an assessment</button></div></div>;

  const r = result;
  const ask = async (item, i) => {
    setOpen(i);
    if (mentor[i]) return;
    try {
      const data = await api.mentor({
        topic: r.topic,
        question: item.question,
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        concept: item.concept,
      });
      setMentor((current) => ({ ...current, [i]: data.message }));
    } catch (error) {
      setMentorError((current) => ({ ...current, [i]: error.message }));
    }
  };

  return <div className="page">
    <header className="page-head">
      <div><span className="mini-label">{attemptId ? 'ASSESSMENT HISTORY' : 'ASSESSMENT COMPLETE'}</span><h1>{r.topic} result</h1><p>{r.generatedBy === 'Gemini' ? 'Your skill gaps were analyzed and converted into a saved learning roadmap.' : 'Your result was analyzed using the built-in scoring engine and converted into a saved learning roadmap.'}</p></div>
      <div className="result-actions">
        {r.roadmapId && <button className="secondary-action" onClick={() => nav(`/roadmap/${r.roadmapId}`)}>View roadmap<Map size={18}/></button>}
        <button className="primary" onClick={() => nav(`/quiz/${encodeURIComponent(r.topic)}?mode=${r.mode || 'gemini'}${r.roadmapId ? `&roadmapId=${r.roadmapId}` : ''}`)}>Reassess<RotateCcw size={18}/></button>
      </div>
    </header>

    <section className="result-hero card">
      <ProgressRing value={r.score} label="Score"/>
      <div><div className="quiz-meta-row"><span className="mini-label">SKILL ANALYSIS</span><span className="ai-badge"><Sparkles size={13}/> {r.generatedBy}</span></div><h2>{r.headline}</h2><p>{r.summary}</p><div className="pill-row">{(r.strengths || []).map((x) => <span className="pill success" key={`s-${x}`}>{x}</span>)}{(r.gaps || []).map((x) => <span className="pill warning" key={`g-${x}`}>{x}</span>)}</div></div>
    </section>

    <section className="card learning-path-card">
      <div className="section-title"><div><span className="mini-label">PERSONALIZED PATH</span><h3>Your next learning steps</h3></div><BookOpenCheck/></div>
      <div className="path-list">{(r.learningPath || []).map((x, i) => <div className="path-item" key={`${x.title}-${i}`}><span>{i + 1}</span><div><strong>{x.title}</strong><p>{x.description}</p></div></div>)}</div>
    </section>

    <section className="card answer-key-card">
      <div className="section-title"><div><span className="mini-label">ANSWER KEY & EXPLANATIONS</span><h3>Review all answers</h3></div><MessageCircleQuestion/></div>
      <p className="answer-key-intro">The correct answer and explanation are stored with your assessment history so you can review them later.</p>
      <div className="answer-key-list">
        {(r.review || []).length ? r.review.map((item, i) => <article className={`answer-key-item ${item.correct ? 'correct' : 'incorrect'}`} key={i}>
          <div className="answer-key-question"><span className={item.correct ? 'status-ok' : 'status-bad'}>{item.correct ? <Check/> : <X/>}</span><div><span className="mini-label">QUESTION {i + 1} · {item.concept}</span><h4>{item.question}</h4></div></div>
          <div className="answer-detail-grid"><div><span>Your answer</span><strong className={item.correct ? 'answer-good' : 'answer-wrong'}>{item.userAnswer}</strong></div><div><span>Correct answer</span><strong className="answer-good">{item.correctAnswer}</strong></div></div>
          <div className="answer-explanation"><span>Explanation</span><p>{item.explanation}</p></div>
          {!item.correct && <div className="mentor-actions"><button className="text-btn" onClick={() => ask(item, i)}><MessageCircleQuestion size={15}/>Explain my mistake with AI Mentor</button>{open === i && <div className="mentor-note">{mentor[i] ? <><b><Sparkles size={14}/>AI Mentor</b><p>{mentor[i]}</p></> : mentorError[i] ? <p className="answer-wrong">{mentorError[i]}</p> : <p>Generating explanation...</p>}</div>}</div>}
        </article>) : <div className="empty-state">Detailed answer review was not stored for this older attempt.</div>}
      </div>
    </section>

    <div className="bottom-cta"><div><h3>Keep improving your skill profile.</h3><p>Complete roadmap steps and reassess the concepts that still need practice.</p></div><button className="primary" onClick={() => nav('/learning')}>Things to Learn<ArrowRight size={18}/></button></div>
  </div>;
}
