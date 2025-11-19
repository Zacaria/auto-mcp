import { Hono } from 'hono';
import type { HonoRequest } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { z } from 'zod';

import type { IngestResult } from '../spec-ingestion';
import { ingestSpec } from '../spec-ingestion';
import { SpecIngestionError } from '../spec-ingestion/errors';
import { InMemoryMcpBuilder, type BuilderState } from '../services/mcp-builder';

const requestSchema = z.object({
  url: z.string().url(),
});

export interface ApiRouterDeps {
  builder: InMemoryMcpBuilder;
  ingestSpec: typeof ingestSpec;
}

const defaultDeps: ApiRouterDeps = {
  builder: new InMemoryMcpBuilder(),
  ingestSpec,
};

export function createApiRouter(deps: ApiRouterDeps = defaultDeps) {
  const app = new Hono();
  const accepted: ContentfulStatusCode = 202;
  const conflict: ContentfulStatusCode = 409;
  const badRequest: ContentfulStatusCode = 400;

  app.post('/api/spec', async (c) => {
    const body = await safeParseJson(c.req);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ code: 'invalid_request', message: 'Invalid request payload.' }, badRequest);
    }

    try {
      const ingestResult = await deps.ingestSpec(parsed.data.url);
      const status = deps.builder.startFromIngest(ingestResult);
      return c.json(formatStatus(status), accepted);
    } catch (error) {
      const mapped = mapError(error);
      return c.json(mapped.body, mapped.status as ContentfulStatusCode);
    }
  });

  app.get('/api/server', (c) => {
    return c.json(formatStatus(deps.builder.getStatus()));
  });

  app.post('/api/server/stop', (c) => {
    const status = deps.builder.stop();
    return c.json(formatStatus(status));
  });

  app.post('/api/server/restart', async (c) => {
    const lastUrl = deps.builder.getLastSpecUrl();
    if (!lastUrl) {
      return c.json(
        {
          code: 'no_spec_loaded',
          message: 'No spec has been loaded yet.',
        },
        conflict,
      );
    }

    try {
      const result = await deps.ingestSpec(lastUrl);
      const status = deps.builder.startFromIngest(result);
      return c.json(formatStatus(status), accepted);
    } catch (error) {
      const mapped = mapError(error);
      return c.json(mapped.body, mapped.status as ContentfulStatusCode);
    }
  });

  return app;
}

function formatStatus(state: BuilderState) {
  return {
    status: state.status,
    specUrl: state.specUrl,
    requestedAt: state.requestedAt,
    metadata: state.metadata,
    bytesWritten: state.bytesWritten,
    cacheHit: state.cacheHit ?? false,
    progress: state.progress,
    tools: state.tools,
    error: state.error,
  };
}

async function safeParseJson(request: HonoRequest) {
  const contentType = request.header('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }
  return {};
}

function mapError(error: unknown): { status: number; body: Record<string, unknown> } {
  if (error instanceof SpecIngestionError) {
    if (error.code === 'size_exceeded') {
      return { status: 413, body: { code: error.code, message: error.message, maxBytes: error.details?.maxBytes } };
    }

    const status =
      error.code === 'invalid_url' || error.code === 'validation_failed' ? 422 : error.details?.status ?? 502;
    return {
      status,
      body: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  return {
    status: 500,
    body: {
      code: 'internal_error',
      message: 'Unexpected server error.',
    },
  };
}
