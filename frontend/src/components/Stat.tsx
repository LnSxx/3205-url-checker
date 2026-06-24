interface StatProps {
  label: string;
  value: string | number;
  status?: string;
}

export default function Stat({ label, value, status }: StatProps) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      {status ? <strong className={`status ${status}`}>{value}</strong> : <strong>{value}</strong>}
    </div>
  );
}
