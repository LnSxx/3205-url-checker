import { create } from 'zustand';
import type { JobDetails, JobSummary } from '../api/jobs.types';
import { cancelJobRequest, createJobRequest, getJobRequest, getJobsRequest } from '../api/jobs-api';

interface JobsState {
  jobs: JobSummary[];
  activeJobId: string | null;
  activeJob: JobDetails | null;

  isLoadingJobs: boolean;
  isLoadingActiveJob: boolean;
  isCreatingJob: boolean;
  isCancellingJob: boolean;

  error: string | null;

  loadJobs: () => Promise<void>;
  loadJobDetails: (jobId: string) => Promise<JobDetails | null>;
  createJob: (urls: string[]) => Promise<string | null>;
  selectJob: (jobId: string) => Promise<void>;
  cancelActiveJob: () => Promise<void>;
  clearError: () => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  activeJobId: null,
  activeJob: null,

  isLoadingJobs: false,
  isLoadingActiveJob: false,
  isCreatingJob: false,
  isCancellingJob: false,

  error: null,

  async loadJobs() {
    set({
      isLoadingJobs: true,
      error: null,
    });

    try {
      const jobs = await getJobsRequest();

      set({
        jobs,
        isLoadingJobs: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isLoadingJobs: false,
      });
    }
  },

  async loadJobDetails(jobId: string) {
    set({
      isLoadingActiveJob: true,
      error: null,
    });

    try {
      const job = await getJobRequest(jobId);

      const { activeJobId } = get();

      if (activeJobId !== jobId) {
        return job;
      }

      set({
        activeJob: job,
        isLoadingActiveJob: false,
      });

      return job;
    } catch (error) {
      const { activeJobId } = get();

      if (activeJobId === jobId) {
        set({
          error: getErrorMessage(error),
          isLoadingActiveJob: false,
        });
      }

      return null;
    }
  },

  async createJob(urls: string[]) {
    set({
      isCreatingJob: true,
      error: null,
    });

    try {
      const response = await createJobRequest({ urls });

      set({
        activeJobId: response.jobId,
        activeJob: null,
        isCreatingJob: false,
      });

      await get().loadJobDetails(response.jobId);
      await get().loadJobs();

      return response.jobId;
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isCreatingJob: false,
      });

      return null;
    }
  },

  async selectJob(jobId: string) {
    set({
      activeJobId: jobId,
      activeJob: null,
      error: null,
    });

    await get().loadJobDetails(jobId);
  },

  async cancelActiveJob() {
    const { activeJobId } = get();

    if (!activeJobId) {
      return;
    }

    set({
      isCancellingJob: true,
      error: null,
    });

    try {
      const cancelledJob = await cancelJobRequest(activeJobId);

      const { activeJobId: latestActiveJobId } = get();

      if (latestActiveJobId === activeJobId) {
        set({
          activeJob: cancelledJob,
        });
      }

      await get().loadJobs();

      set({
        isCancellingJob: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error),
        isCancellingJob: false,
      });
    }
  },

  clearError() {
    set({
      error: null,
    });
  },
}));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
}
