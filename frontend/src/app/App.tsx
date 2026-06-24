import './App.css';
import { CreateJobForm } from '../components/CreateJobForm';
import { useActiveJobPolling } from '../hooks/use-active-job-polling';
import { useJobsStore } from '../store/jobs-store';
import JobDetails from '../components/JobDetails';
import JobsList from '../components/JobsList';

function App() {
  useActiveJobPolling();

  const error = useJobsStore((state) => state.error);
  const clearError = useJobsStore((state) => state.clearError);

  return (
    <main id="app-shell">
      <header id="app-header">
        <div>
          <p className="eyebrow">Тестовое задание для 3205.team</p>
          <h2>Сервис асинхронной проверки списка URL</h2>
          <p className="lead">
            Бекенд написан на TypeScript с использованием NestJS, фронтенд на React с использованием
            Vite. Стор - Zustand.
          </p>
        </div>
      </header>

      {error ? (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Скрыть
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
