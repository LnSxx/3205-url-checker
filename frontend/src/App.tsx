import './App.css';
import { CreateJobForm } from './components/CreateJobForm';
import { JobDetails } from './components/JobDetails';
import { JobsList } from './components/JobsList';
import { useActiveJobPolling } from './hooks/use-active-job-polling';
import { useJobsStore } from './store/jobs-store';

function App() {
  useActiveJobPolling();

  const error = useJobsStore((state) => state.error);
  const clearError = useJobsStore((state) => state.clearError);

  return (
    <main id="app-shell">
      <header id="app-header">
        <div>
          <p className="eyebrow">Fullstack URL checker</p>
          <h1>Asynchronous URL checking service</h1>
          <p className="lead">
            Create jobs, track URL checks, inspect results, and cancel running jobs.
          </p>
        </div>
      </header>

      {error ? (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section id="workspace">
        <div id="sidebar">
          <CreateJobForm />
          <JobsList />
        </div>

        <JobDetails />
      </section>
    </main>
  );
}

export default App;
