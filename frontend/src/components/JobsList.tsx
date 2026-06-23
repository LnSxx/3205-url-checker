import { useEffect } from 'react';
import type { JobSummary } from '../api/types';
import { useJobsStore } from '../store/jobs-store';

export function JobsList() {
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
          <h2>Jobs</h2>
          <p>Latest created jobs.</p>
        </div>

        <button type="button" onClick={() => void loadJobs()}>
          Refresh
        </button>
      </div>

      {isLoadingJobs && jobs.length === 0 ? <p className="muted">Loading jobs...</p> : null}
      {jobs.length === 0 && !isLoadingJobs ? <p className="muted">No jobs yet.</p> : null}

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

interface JobListItemProps {
  job: JobSummary;
  isActive: boolean;
  onClick: () => void;
}

function JobListItem({ job, isActive, onClick }: JobListItemProps) {
  return (
    <button type="button" className={isActive ? 'job-card active' : 'job-card'} onClick={onClick}>
      <span className="mono">{job.id}</span>
      <span className={`status ${job.status}`}>{job.status}</span>
      <span className="muted">{new Date(job.createdAt).toLocaleString()}</span>
      <span>
        {job.processed}/{job.total} processed
      </span>
      <span className="muted">
        Success: {job.success}, Error: {job.error}, Cancelled: {job.cancelled}
      </span>
    </button>
  );
}
