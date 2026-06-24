import { UrlCheck } from '../domain/models/url-check.model';
import { UrlCheckResponseDto } from '../dto/response/url-check-response.dto';

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
