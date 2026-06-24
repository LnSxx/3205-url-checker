import { useEffect } from 'react';
import { useJobsStore } from '../store/jobs-store';
import JobListItem from './JobListItem';

export default function JobsList() {
  const jobs = useJobsStore((state) => state.jobs);
  const activeJobId = useJobsStore((state) => state.activeJobId);
  const isLoadingJobs = useJobsStore((state) => state.isLoadingJobs);
  const loadJobs = useJobsStore((state) => state.loadJobs);
  const selectJob = useJobsStore((state) => state.selectJob);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Задачи</h2>
          <p>Ранее созданные задачи.</p>
        </div>

        <button type="button" onClick={() => void loadJobs()}>
          Обновить
        </button>
      </div>

      {isLoadingJobs && jobs.length === 0 ? <p className="muted">Загрузка задач...</p> : null}
      {jobs.length === 0 && !isLoadingJobs ? <p className="muted">Нет задач.</p> : null}

      <div className="job-list">
        {jobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            isActive={job.id === activeJobId}
            onClick={() => void selectJob(job.id)}
          />
        ))}
      </div>
    </section>
  );
}
