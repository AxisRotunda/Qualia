import { Injectable, signal, computed } from '@angular/core';

export interface FSOperation {
  id: string;
  action: 'move' | 'delete' | 'create' | 'create_dir';
  source: string;
  destination?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilesystemService {
  // Mock data representing the state of src/docs/core/fs-manifest.json
  private operations = signal<FSOperation[]>([
    {
      id: 'refactor_docs_v4',
      action: 'move',
      source: 'src/docs/history/system-instructions.md',
      destination: 'src/docs/core/system-instructions.md',
      status: 'pending',
      timestamp: Date.now()
    },
    {
      id: 'cleanup_legacy_fragments',
      action: 'delete',
      source: 'src/docs/history/fragments/fragment-001.md',
      status: 'pending',
      timestamp: Date.now()
    },
    {
      id: 'init_tiered_docs',
      action: 'create_dir',
      source: 'src/docs/core',
      status: 'completed',
      timestamp: Date.now() - 86400000
    }
  ]);

  readonly pendingOps = computed(() => 
    this.operations().filter(op => op.status === 'pending')
  );

  readonly historyOps = computed(() => 
    this.operations().filter(op => op.status !== 'pending')
  );

  readonly hasPending = computed(() => this.pendingOps().length > 0);

  /**
   * Generates a Node.js synchronization script based on the manifest.
   * This bridges the gap for non-MCP environments.
   */
  generateSyncScript(): string {
    const ops = this.pendingOps();
    if (ops.length === 0) return '// No pending operations.';

    let script = `const fs = require('fs');\nconst path = require('path');\n\nconsole.log('--- QUALIA FS SYNC START ---');\n\n`;

    ops.forEach(op => {
      if (op.action === 'move' && op.destination) {
        script += `// Operation: ${op.id}\ntry {\n  const destDir = path.dirname('${op.destination}');\n  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });\n  if (fs.existsSync('${op.source}')) {\n    fs.renameSync('${op.source}', '${op.destination}');\n    console.log('MOVED: ${op.source} -> ${op.destination}');\n  }\n} catch (e) { console.error('FAILED: ${op.id}', e.message); }\n\n`;
      } else if (op.action === 'delete') {
        script += `// Operation: ${op.id}\ntry {\n  if (fs.existsSync('${op.source}')) {\n    fs.unlinkSync('${op.source}');\n    console.log('DELETED: ${op.source}');\n  }\n} catch (e) { console.error('FAILED: ${op.id}', e.message); }\n\n`;
      }
    });

    script += `console.log('--- SYNC COMPLETE ---');`;
    return script;
  }
}