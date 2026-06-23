import { useEffect } from 'react';
import { isFinalJobStatus, useJobsStore } from '../store/jobs-store';

const POLLING_INTERVAL_MS = 1_000;

export function useActiveJobPolling() {
  const activeJobId = useJobsStore((state) => state.activeJobId);
  const activeJobStatus = useJobsStore((state) => state.activeJob?.status);
  const loadJobDetails = useJobsStore((state) => state.loadJobDetails);
  const loadJobs = useJobsStore((state) => state.loadJobs);

  useEffect(() => {
    if (!activeJobId) {
      return;
    }

    if (activeJobStatus && isFinalJobStatus(activeJobStatus)) {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | undefined;

    async function poll(jobId: string) {
      const job = await loadJobDetails(jobId);

      if (isCancelled) {
        return;
      }

      const latestActiveJobId = useJobsStore.getState().activeJobId;

      if (latestActiveJobId !== jobId) {
        return;
      }

      await loadJobs();

      if (!job || isFinalJobStatus(job.status)) {
        return;
      }

      timeoutId = window.setTimeout(() => {
        void poll(jobId);
      }, POLLING_INTERVAL_MS);
    }

    void poll(activeJobId);

    return () => {
      isCancelled = true;

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeJobId, activeJobStatus, loadJobDetails, loadJobs]);
}
