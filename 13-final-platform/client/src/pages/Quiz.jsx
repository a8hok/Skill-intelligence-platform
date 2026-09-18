import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Library } from 'lucide-react';

export default function Quiz() {
  const { topic } = useParams();
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'local' ? 'local' : 'gemini';
  const roadmapId = params.get('roadmapId');
  const [data, setData] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    setData(null); setIdx(0); setAnswers({}); setError('');
    api.quiz(topic, mode, roadmapId).then(setData).catch((err) => setError(err.message));
  }, [topic, mode, roadmapId]);

  if (error) return <div className="page"><div className="empty-state card"><h3>Unable to generate this assessment</h3><p>{error}</p><button className="primary" onClick={() => nav('/topics')}>Back to topics</button></div></div>;
  if (!data) return <div className="page"><div className="skeleton quiz-skeleton"/><div className="ai-generating">{mode === 'gemini' ? <Sparkles size={17}/> : <Library size={17}/>} {mode === 'gemini' ? 'Gemini is creating 10 fresh questions...' : 'Preparing 10 questions from the built-in question bank...'}</div></div>;

  const q = data.questions[idx];
  const submit = async () => {
    setLoading(true);
    try {
      const result = await api.submit({ assessmentId: data.assessmentId, answers });
      sessionStorage.setItem('latestResult', JSON.stringify(result));
      nav('/results');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return <div className="quiz-page">
    <div className="quiz-top"><button className="ghost" onClick={() => nav(roadmapId ? `/roadmap/${roadmapId}` : '/topics')}><ChevronLeft size={18}/>Exit</button><div><span>{data.topic}</span><b>{idx + 1} / {data.questions.length}</b></div></div>
    <div className="quiz-progress"><i style={{ width: `${((idx + 1) / data.questions.length) * 100}%` }}/></div>
    {data.reassessmentFocus?.length > 0 && <div className="focus-banner">Targeted reassessment · Focus: {data.reassessmentFocus.join(', ')}</div>}
    <div className="quiz-card"><div className="quiz-meta-row"><span className="mini-label">QUESTION {idx + 1}</span><span className="ai-badge">{data.generatedBy === 'Gemini' ? <Sparkles size={13}/> : <Library size={13}/>} {data.generatedBy}</span></div><h2>{q.question}</h2><div className="options">{q.options.map((opt, i) => <button key={`${i}-${opt}`} className={answers[q.id] === i ? 'selected' : ''} onClick={() => setAnswers({ ...answers, [q.id]: i })}><span>{String.fromCharCode(65 + i)}</span>{opt}{answers[q.id] === i && <CheckCircle2 size={20}/>}</button>)}</div><div className="quiz-actions"><button className="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ChevronLeft size={18}/>Previous</button>{idx < data.questions.length - 1 ? <button className="primary" disabled={answers[q.id] === undefined} onClick={() => setIdx(idx + 1)}>Next<ChevronRight size={18}/></button> : <button className="primary" disabled={Object.keys(answers).length < data.questions.length || loading} onClick={submit}>{loading ? 'Analyzing...' : 'Submit assessment'}<ChevronRight size={18}/></button>}</div></div>
  </div>;
}
