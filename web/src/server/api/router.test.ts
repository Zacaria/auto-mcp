import { writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createApiRouter, type ApiRouterDeps } from './router';
import type { IngestResult } from '../spec-ingestion';
import { SpecIngestionError } from '../spec-ingestion/errors';
import { InMemoryMcpBuilder } from '../services/mcp-builder';

const baseResult = (): IngestResult => ({
  metadata: {
    url: 'https://example.com/spec.json',
    contentLength: 100,
  },
  bytesWritten: 100,
  filePath: '',
  document: {
    openapi: '3.0.3',
    info: { title: 'Test', version: '1.0.0' },
    paths: {},
  },
});

async function createTempFile() {
  const dir = await mkdtemp(path.join(tmpdir(), 'spec-test-'));
  const file = path.join(dir, 'spec.json');
  await writeFile(file, '{}');
  return file;
}

function createDeps(overrides: Partial<ApiRouterDeps> = {}): ApiRouterDeps {
  const builder = new InMemoryMcpBuilder();
  const ingestMock: ApiRouterDeps['ingestSpec'] = vi.fn(async () => {
      const result = baseResult();
      result.filePath = await createTempFile();
      return result;
    });
  return {
    builder,
    ingestSpec: ingestMock,
    ...overrides,
  };
}

describe('API router', () => {
  it('accepts spec submission and returns status', async () => {
    const deps = createDeps();
    const app = createApiRouter(deps);
    const res = await app.request('/api/spec', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/spec.json' }),
    });
    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json.status).toBe('building');
    expect(deps.ingestSpec).toHaveBeenCalledTimes(1);
  });

  it('returns current status via GET /api/server', async () => {
    const deps = createDeps();
    const ingest = await deps.ingestSpec('https://example.com/spec.json');
    deps.builder.startFromIngest(ingest);
    const app = createApiRouter(deps);
    const res = await app.request('/api/server');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBeDefined();
  });

  it('handles ingestion errors on /api/spec', async () => {
    const deps = createDeps({
      ingestSpec: vi.fn(async () => {
        throw new SpecIngestionError('size_exceeded', 'Too large', { maxBytes: 10 });
      }),
    });
    const app = createApiRouter(deps);
    const res = await app.request('/api/spec', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/spec.json' }),
    });
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.code).toBe('size_exceeded');
  });

  it('rejects restart when no spec is loaded', async () => {
    const deps = createDeps();
    const app = createApiRouter(deps);
    const res = await app.request('/api/server/restart', { method: 'POST' });
    expect(res.status).toBe(409);
  });

  it('restarts using last spec URL', async () => {
    const deps = createDeps();
    const app = createApiRouter(deps);
    await app.request('/api/spec', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/spec.json' }),
    });
    const res = await app.request('/api/server/restart', { method: 'POST' });
    expect(res.status).toBe(202);
    expect(deps.ingestSpec).toHaveBeenCalledTimes(2);
  });

  it('can stop the builder', async () => {
    const deps = createDeps();
    const app = createApiRouter(deps);
    await app.request('/api/spec', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/spec.json' }),
    });
    const res = await app.request('/api/server/stop', { method: 'POST' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('idle');
  });
});
