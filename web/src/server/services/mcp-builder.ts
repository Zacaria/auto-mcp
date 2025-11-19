import { unlink } from 'node:fs/promises';

import type { IngestResult } from '../spec-ingestion';

export type BuilderStatus = 'idle' | 'building' | 'ready' | 'error';

export interface ToolSummary {
  name: string;
  description?: string;
  method?: string;
  path?: string;
  schema?: unknown;
}

export interface BuilderState {
  status: BuilderStatus;
  specUrl?: string;
  requestedAt?: string;
  metadata?: IngestResult['metadata'];
  bytesWritten?: number;
  cacheHit?: boolean;
  progress?: { processed: number; total: number };
  tools: ToolSummary[];
  error?: { code?: string; message: string };
}

export class InMemoryMcpBuilder {
  private state: BuilderState = { status: 'idle', tools: [] };
  private lastSpecUrl?: string;
  private currentFilePath?: string;

  getStatus(): BuilderState {
    return this.state;
  }

  getLastSpecUrl(): string | undefined {
    return this.lastSpecUrl;
  }

  startFromIngest(result: IngestResult): BuilderState {
    const requestedAt = new Date().toISOString();
    this.cleanupTempFile().catch(() => {
      // swallow cleanup issues
    });

    this.state = {
      status: 'building',
      specUrl: result.metadata.url,
      requestedAt,
      metadata: result.metadata,
      bytesWritten: result.bytesWritten,
      cacheHit: false,
      tools: [],
    };

    this.lastSpecUrl = result.metadata.url;
    this.currentFilePath = result.filePath;

    this.finishBuild(result).catch((error) => {
      this.state = {
        ...this.state,
        status: 'error',
        error: {
          message: (error as Error)?.message ?? 'Builder failed',
        },
      };
    });

    return this.state;
  }

  stop(): BuilderState {
    this.cleanupTempFile().catch(() => {});
    this.state = { status: 'idle', tools: [] };
    return this.state;
  }

  private async finishBuild(result: IngestResult) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    // Placeholder: future worker-based builder will replace this.
    this.state = {
      ...this.state,
      status: 'ready',
      tools: [],
      metadata: result.metadata,
    };
    await this.cleanupTempFile();
  }

  private async cleanupTempFile() {
    if (!this.currentFilePath) return;
    const file = this.currentFilePath;
    this.currentFilePath = undefined;
    try {
      await unlink(file);
    } catch {
      // ignore
    }
  }
}
