import { UrlCheckResponseDto } from '../dto/url-check-response.dto';
import { UrlCheck } from '../types/url-check';

export function toUrlCheckResponseDto(urlCheck: UrlCheck): UrlCheckResponseDto {
  return {
    id: urlCheck.id,
    url: urlCheck.url,
    status: urlCheck.status,
    httpStatus: urlCheck.httpStatus,
    errorMessage: urlCheck.errorMessage,
    startedAt: urlCheck.startedAt,
    finishedAt: urlCheck.finishedAt,
    durationMs: urlCheck.durationMs,
  };
}
