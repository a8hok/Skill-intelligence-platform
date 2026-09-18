export default function ProgressRing({ value = 0, label = 'Overall' }) {
  const v = Math.max(0, Math.min(100, value));
  return <div className="ring-wrap"><div className="ring" style={{'--p': `${v * 3.6}deg`}}><div><strong>{v}%</strong><span>{label}</span></div></div></div>;
}
