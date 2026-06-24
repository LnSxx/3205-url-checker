import type { JobSummary } from '../api/types';

interface JobListItemProps {
  job: JobSummary;
  isActive: boolean;
  onClick: () => void;
}

export default function JobListItem({ job, isActive, onClick }: JobListItemProps) {
  return (
    <button type="button" className={isActive ? 'job-card active' : 'job-card'} onClick={onClick}>
      <span className="mono">{job.id}</span>
      <span className={`status ${job.status}`}>{job.status}</span>
      <span className="muted">{new Date(job.createdAt).toLocaleString()}</span>
      <span>
        {job.processed}/{job.total} обработано
      </span>
      <span className="muted">
        Успешно: {job.success}, Ошибки: {job.error}, Отменено: {job.cancelled}
      </span>
    </button>
  );
}
