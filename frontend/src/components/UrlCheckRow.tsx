import type { UrlCheck } from '../api/types';

interface UrlCheckRowProps {
  urlCheck: UrlCheck;
}

export default function UrlCheckRow({ urlCheck }: UrlCheckRowProps) {
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
