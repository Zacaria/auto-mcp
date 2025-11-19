export type SpecErrorCode =
  | 'invalid_url'
  | 'head_failed'
  | 'size_exceeded'
  | 'download_failed'
  | 'validation_failed';

export interface SpecErrorDetails {
  status?: number;
  maxBytes?: number;
  cause?: unknown;
  fieldErrors?: unknown;
}

export class SpecIngestionError extends Error {
  readonly code: SpecErrorCode;
  readonly details?: SpecErrorDetails;

  constructor(code: SpecErrorCode, message: string, details?: SpecErrorDetails) {
    super(message);
    this.name = 'SpecIngestionError';
    this.code = code;
    this.details = details;
  }
}

export const createSizeExceededError = (maxBytes: number) =>
  new SpecIngestionError('size_exceeded', `Spec exceeds allowed size (${maxBytes} bytes).`, {
    status: 413,
    maxBytes,
  });

