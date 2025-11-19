import { readFileSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  headSpec,
  ingestSpec,
  sanitizeSpecUrl,
  streamSpecToFile,
  validateOpenApiDocument,
} from './index';

const PETSTORE_URL = 'https://example.com/petstore.json';
const LARGE_URL = 'https://example.com/petstore-large.json';
const INVALID_URL = 'https://example.com/invalid.json';

const petstoreBody = readFixture('petstore-small.json');
const invalidBody = readFixture('invalid-spec.json');

const originalFetch = global.fetch;

afterEach(async () => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('spec ingestion utilities', () => {
  it('sanitizes URLs and rejects invalid protocols', () => {
    expect(() => sanitizeSpecUrl('ftp://example.com/spec')).toThrowError('Only HTTPS spec URLs');
    expect(() => sanitizeSpecUrl('https://example.com/spec')).not.toThrow();
  });

  it('performs HEAD checks and enforces explicit size limits', async () => {
    mockFetch({
      [PETSTORE_URL]: {
        head: {
          headers: { 'content-length': String(petstoreBody.length) },
        },
      },
    });

    const metadata = await headSpec(PETSTORE_URL, { maxBytes: 1024 * 1024 });
    expect(metadata.contentLength).toBe(petstoreBody.length);

    await expect(headSpec(PETSTORE_URL, { maxBytes: 16 })).rejects.toMatchObject({
      code: 'size_exceeded',
    });
  });

  it('streams specs to disk and validates OpenAPI', async () => {
    mockFetch({
      [PETSTORE_URL]: {
        head: {
          headers: { 'content-length': String(petstoreBody.length) },
        },
        get: {
          headers: { 'content-type': 'application/json' },
          body: petstoreBody,
        },
      },
    });

    const result = await streamSpecToFile(PETSTORE_URL);
    expect(result.bytesWritten).toBeGreaterThan(0);
    const validation = await validateOpenApiDocument(result.filePath);
    expect(validation.document.openapi).toContain('3.0');
    await unlink(result.filePath);
  });

  it('aborts downloads that exceed byte caps when content-length is missing', async () => {
    mockFetch({
      [LARGE_URL]: {
        head: { headers: {} },
        get: {
          headers: { 'content-type': 'application/json' },
          body: createChunkedBody(2048),
        },
      },
    });

    await expect(streamSpecToFile(LARGE_URL, { maxBytes: 512 })).rejects.toMatchObject({
      code: 'size_exceeded',
    });
  });

  it('fails validation for invalid specs', async () => {
    mockFetch({
      [INVALID_URL]: {
        head: { headers: { 'content-length': String(invalidBody.length) } },
        get: {
          headers: { 'content-type': 'application/json' },
          body: invalidBody,
        },
      },
    });

    const streamResult = await streamSpecToFile(INVALID_URL);
    await expect(validateOpenApiDocument(streamResult.filePath)).rejects.toMatchObject({
      code: 'validation_failed',
    });
    await unlink(streamResult.filePath);
  });

  it('ingests specs end-to-end', async () => {
    mockFetch({
      [PETSTORE_URL]: {
        head: { headers: { 'content-length': String(petstoreBody.length) } },
        get: {
          headers: { 'content-type': 'application/json' },
          body: petstoreBody,
        },
      },
    });

    const result = await ingestSpec(PETSTORE_URL);
    expect(result.document.paths?.['/pets']).toBeDefined();
    await unlink(result.filePath);
  });
});

type Scenario = {
  head?: ResponseOptions;
  get?: ResponseOptions;
};

type ResponseOptions = {
  status?: number;
  headers?: Record<string, string>;
  body?: BodyInit | null;
};

function mockFetch(scenarios: Record<string, Scenario>) {
  global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' || input instanceof URL ? input.toString() : String(input);
    const method = init?.method?.toUpperCase() ?? 'GET';
    const scenario = scenarios[url];
    if (!scenario) {
      throw new Error(`No mock scenario for ${url}`);
    }

    const responseOptions = method === 'HEAD' ? scenario.head : scenario.get;
    if (!responseOptions) {
      throw new Error(`No mock for ${method} ${url}`);
    }

    const { body = null, headers = {}, status = 200 } = responseOptions;
    return new Response(body, { status, headers });
  }) as typeof fetch;
}

function readFixture(filename: string) {
  const absolute = path.resolve(__dirname, '../../../test/fixtures', filename);
  return readFileSync(absolute);
}

function createChunkedBody(size: number) {
  const encoder = new TextEncoder();
  const chunk = encoder.encode('a'.repeat(256));
  let bytesEmitted = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (bytesEmitted >= size) {
        controller.close();
        return;
      }
      bytesEmitted += chunk.byteLength;
      controller.enqueue(chunk);
    },
  });
}
