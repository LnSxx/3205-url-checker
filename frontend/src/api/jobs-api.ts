import type { CreateJobRequest, CreateJobResponse, JobDetails, JobSummary } from './jobs.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const message = await getErrorMessage(response);

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };

    return body.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

export function createJobRequest(payload: CreateJobRequest): Promise<CreateJobResponse> {
  return request<CreateJobResponse>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getJobsRequest(): Promise<JobSummary[]> {
  return request<JobSummary[]>('/jobs');
}

export function getJobRequest(jobId: string): Promise<JobDetails> {
  return request<JobDetails>(`/jobs/${jobId}`);
}

export function cancelJobRequest(jobId: string): Promise<JobDetails> {
  return request<JobDetails>(`/jobs/${jobId}`, {
    method: 'DELETE',
  });
}
