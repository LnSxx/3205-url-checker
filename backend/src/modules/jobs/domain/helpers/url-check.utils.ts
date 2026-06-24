import { UrlCheck } from '../models/url-check.model';

export function calculateUrlCheckDurationMs(urlCheck: UrlCheck): number | undefined {
  if (!urlCheck.startedAt || !urlCheck.finishedAt) {
    return undefined;
  }

  return new Date(urlCheck.finishedAt).getTime() - new Date(urlCheck.startedAt).getTime();
}
