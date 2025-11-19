import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdtemp, unlink } from 'node:fs/promises';
import { isIP } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';

import { SpecIngestionError, createSizeExceededError } from './errors';

const BLOCKED_HOSTS = new Set(['localhost', '0.0.0.0', '127.0.0.1', '[::1]']);
const BLOCKED_SUFFIXES = ['.local', '.localhost'];

export const DEFAULT_SPEC_MAX_BYTES = Number(process.env.SPEC_MAX_BYTES ?? 10 * 1024 * 1024);
export const DEFAULT_SPEC_TIMEOUT_MS = Number(process.env.SPEC_REQUEST_TIMEOUT_MS ?? 15_000);

export interface NetworkOptions {
  maxBytes?: number;
  timeoutMs?: number;
  allowHttp?: boolean;
}

export interface HeadSpecResult {
  url: string;
  contentLength?: number;
  etag?: string;
  lastModified?: string;
  contentType?: string;
}

export interface StreamResult {
  filePath: string;
  bytesWritten: number;
}

export interface IngestResult extends StreamResult {
  metadata: HeadSpecResult;
  document: OpenAPIV3.Document;
}

const resolveAllowHttp = (allowHttp?: boolean) => Boolean(allowHttp);

export function sanitizeSpecUrl(raw: string, options: NetworkOptions = {}): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new SpecIngestionError('invalid_url', 'Spec URL is not a valid URL.');
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== 'https:' && !(resolveAllowHttp(options.allowHttp) && protocol === 'http:')) {
    throw new SpecIngestionError('invalid_url', 'Only HTTPS spec URLs are allowed.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(hostname) || BLOCKED_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new SpecIngestionError('invalid_url', 'Local or loopback hosts are not allowed.');
  }

  if (isIP(hostname) && isPrivateIp(hostname)) {
    throw new SpecIngestionError('invalid_url', 'Private network addresses are not allowed.');
  }

  return parsed;
}

export async function headSpec(rawUrl: string, options: NetworkOptions = {}): Promise<HeadSpecResult> {
  const url = sanitizeSpecUrl(rawUrl, options).toString();
  const maxBytes = options.maxBytes ?? DEFAULT_SPEC_MAX_BYTES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_SPEC_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
    if (!response.ok) {
      throw new SpecIngestionError(
        'head_failed',
        `HEAD request failed with status ${response.status}.`,
        { status: response.status },
      );
    }

    const contentLengthHeader = response.headers.get('content-length');
    const contentLength =
      typeof contentLengthHeader === 'string' && contentLengthHeader.trim().length > 0
        ? Number(contentLengthHeader)
        : undefined;

    if (contentLength && Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw createSizeExceededError(maxBytes);
    }

    return {
      url,
      contentLength,
      etag: response.headers.get('etag') ?? undefined,
      lastModified: response.headers.get('last-modified') ?? undefined,
      contentType: response.headers.get('content-type') ?? undefined,
    };
  } catch (error) {
    if (error instanceof SpecIngestionError) throw error;
    if ((error as Error)?.name === 'AbortError') {
      throw new SpecIngestionError('head_failed', 'HEAD request timed out.', { cause: error });
    }
    throw new SpecIngestionError('head_failed', 'HEAD request failed.', { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

export async function streamSpecToFile(
  rawUrl: string,
  options: NetworkOptions = {},
): Promise<StreamResult> {
  const url = sanitizeSpecUrl(rawUrl, options).toString();
  const maxBytes = options.maxBytes ?? DEFAULT_SPEC_MAX_BYTES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_SPEC_TIMEOUT_MS;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const tempDir = await mkdtemp(path.join(tmpdir(), 'openapi-spec-'));
  const filePath = path.join(tempDir, `${randomUUID()}.json`);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok || !response.body) {
      throw new SpecIngestionError(
        'download_failed',
        `Failed to download spec (status ${response.status}).`,
        { status: response.status },
      );
    }

    const fileStream = createWriteStream(filePath);
    const reader = Readable.fromWeb(response.body as any);
    let bytesWritten = 0;
    const byteLimiter = new Transform({
      transform(chunk, _encoding, callback) {
        bytesWritten += chunk.length;
        if (bytesWritten > maxBytes) {
          callback(createSizeExceededError(maxBytes));
          return;
        }
        callback(null, chunk);
      },
    });

    await pipeline(reader, byteLimiter, fileStream);

    if (bytesWritten === 0) {
      throw new SpecIngestionError('download_failed', 'Spec download produced no data.');
    }

    return { filePath, bytesWritten };
  } catch (error) {
    await safeUnlink(filePath);
    if (error instanceof SpecIngestionError) throw error;
    if ((error as Error)?.name === 'AbortError') {
      throw new SpecIngestionError('download_failed', 'Spec download timed out.', { cause: error });
    }
    throw new SpecIngestionError('download_failed', 'Failed to download spec.', { cause: error });
  } finally {
    clearTimeout(timeout);
  }
}

export async function validateOpenApiDocument(filePath: string) {
  try {
    const document = (await SwaggerParser.validate(filePath)) as OpenAPIV3.Document;
    if (!document.openapi?.startsWith('3.')) {
      throw new SpecIngestionError(
        'validation_failed',
        'Spec is not an OpenAPI 3.x document.',
      );
    }
    return { document };
  } catch (error) {
    if (error instanceof SpecIngestionError) throw error;
    throw new SpecIngestionError('validation_failed', 'Spec failed OpenAPI validation.', {
      cause: error,
    });
  }
}

export async function ingestSpec(
  url: string,
  options: NetworkOptions = {},
): Promise<IngestResult> {
  const metadata = await headSpec(url, options);
  const streamResult = await streamSpecToFile(url, {
    ...options,
  });
  const validation = await validateOpenApiDocument(streamResult.filePath);

  return {
    metadata,
    filePath: streamResult.filePath,
    bytesWritten: streamResult.bytesWritten,
    document: validation.document,
  };
}

function isPrivateIp(hostname: string) {
  if (hostname === '::1') return true;
  const octets = hostname.split('.').map((part) => Number(part));
  if (octets.length !== 4 || octets.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = octets;
  if (first === 10) return true;
  if (first === 127) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  return false;
}

async function safeUnlink(filePath: string) {
  try {
    await unlink(filePath);
  } catch {
    // ignore cleanup failures
  }
}
