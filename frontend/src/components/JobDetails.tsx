import { isFinalJobStatus, useJobsStore } from '../store/jobs-store';
import Stat from './Stat';
import UrlCheckRow from './UrlCheckRow';

export default function JobDetails() {
  const activeJob = useJobsStore((state) => state.activeJob);
  const isLoadingActiveJob = useJobsStore((state) => state.isLoadingActiveJob);
  const isCancellingJob = useJobsStore((state) => state.isCancellingJob);
  const cancelActiveJob = useJobsStore((state) => state.cancelActiveJob);

  if (!activeJob) {
    return (
      <section className="panel details-panel">
        <p className="muted">
          {isLoadingActiveJob
            ? 'Загрузка задачи...'
            : 'Выберите задачу из списка слева или создайте новую.'}
        </p>
      </section>
    );
  }

  const canCancel = !isFinalJobStatus(activeJob.status);

  return (
    <section className="panel details-panel">
      <div className="panel-header">
        <div>
          <h2>Детали задачи</h2>
          <p className="mono">{activeJob.id}</p>
        </div>

        <button
          type="button"
          disabled={!canCancel || isCancellingJob}
          onClick={() => void cancelActiveJob()}
        >
          {isCancellingJob ? 'Отмена...' : 'Отменить задачу'}
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
