import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { useJobsStore } from '../store/jobs-store';

export function CreateJobForm() {
  const [value, setValue] = useState('');
  const createJob = useJobsStore((state) => state.createJob);
  const isCreatingJob = useJobsStore((state) => state.isCreatingJob);

  const urls = value
    .split('\n')
    .map((url) => url.trim())
    .filter(Boolean);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (urls.length === 0) {
      return;
    }

    const jobId = await createJob(urls);

    if (jobId) {
      setValue('');
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h2>Create job</h2>
          <p>Enter one URL per line.</p>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={'https://example.com\nhttps://github.com'}
        rows={8}
      />

      <div className="panel-footer">
        <span className="counter">{urls.length} URLs</span>
        <button type="submit" disabled={isCreatingJob || urls.length === 0}>
          {isCreatingJob ? 'Creating...' : 'Start checking'}
        </button>
      </div>
    </form>
  );
}
