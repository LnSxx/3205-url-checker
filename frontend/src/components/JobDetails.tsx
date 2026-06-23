import type { UrlCheck } from '../api/types';
import { isFinalJobStatus, useJobsStore } from '../store/jobs-store';

export function JobDetails() {
  const activeJob = useJobsStore((state) => state.activeJob);
  const isLoadingActiveJob = useJobsStore((state) => state.isLoadingActiveJob);
  const isCancellingJob = useJobsStore((state) => state.isCancellingJob);
  const cancelActiveJob = useJobsStore((state) => state.cancelActiveJob);

  if (!activeJob) {
    return (
      <section className="panel details-panel">
        <h2>Job details</h2>
        <p className="muted">
          {isLoadingActiveJob ? 'Loading job...' : 'Select a job to see details.'}
        </p>
      </section>
    );
  }

  const canCancel = !isFinalJobStatus(activeJob.status);

  return (
    <section className="panel details-panel">
      <div className="panel-header">
        <div>
          <h2>Job details</h2>
          <p className="mono">{activeJob.id}</p>
        </div>

        <button
          type="button"
          disabled={!canCancel || isCancellingJob}
          onClick={() => void cancelActiveJob()}
        >
          {isCancellingJob ? 'Cancelling...' : 'Cancel job'}
        </button>
      </div>

      <div className="stats-grid">
        <Stat label="Status" value={activeJob.status} status={activeJob.status} />
        <Stat label="Progress" value={`${activeJob.processed}/${activeJob.total}`} />
        <Stat label="Success" value={activeJob.success} />
        <Stat label="Error" value={activeJob.error} />
        <Stat label="Cancelled" value={activeJob.cancelled} />
      </div>

      <div className="url-list">
        {activeJob.urls.map((urlCheck) => (
          <UrlCheckRow key={urlCheck.id} urlCheck={urlCheck} />
        ))}
      </div>
    </section>
  );
}

interface StatProps {
  label: string;
  value: string | number;
  status?: string;
}

function Stat({ label, value, status }: StatProps) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      {status ? <strong className={`status ${status}`}>{value}</strong> : <strong>{value}</strong>}
    </div>
  );
}

interface UrlCheckRowProps {
  urlCheck: UrlCheck;
}

function UrlCheckRow({ urlCheck }: UrlCheckRowProps) {
  return (
    <article className="url-card">
      <div>
        <strong>{urlCheck.url}</strong>
        <p className="muted">
          {urlCheck.durationMs !== undefined ? `${urlCheck.durationMs} ms` : 'Not finished'}
        </p>
      </div>

      <div className="url-meta">
        <span className={`status ${urlCheck.status}`}>{urlCheck.status}</span>

        {urlCheck.httpStatus !== undefined ? <span>HTTP {urlCheck.httpStatus}</span> : null}
        {urlCheck.errorMessage ? <span className="error-text">{urlCheck.errorMessage}</span> : null}
      </div>
    </article>
  );
}
