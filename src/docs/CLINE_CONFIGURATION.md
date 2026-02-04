# CLINE Configuration Guide
> **Scope**: Agent tooling integration
> **Source**: `src/docs/CLINE_CONFIGURATION.md`
> **Audience**: AI Agent + Developer
> **Version**: 1.0.0

---

## 1. Skills & Workflows Discovery

### Current Status
| Component | Location | Status |
|-----------|----------|--------|
| Skills | `.cline/skills/*.json` | ✅ Present |
| Workflows | `.cline/workflows/*.json` | ✅ Present |
| VS Code Settings | `.vscode/settings.json` | ✅ Created |

### Registered Skills
| Skill | Trigger | Protocol |
|-------|---------|----------|
| `ecs-architecture` | Entity management tasks | `src/docs/ecs-architecture.md` |
| `repository-management` | `SYNC_REPO` or git tasks | `src/docs/protocols/protocol-git-sync.md` |
| `documentation-sync` | `RUN_KNOWLEDGE` or doc tasks | `src/docs/protocols/protocol-knowledge.md` |
| `physics-dynamics` | `RUN_PHYS` or physics tasks | `src/docs/protocols/protocol-dynamics.md` |
| `pbr-materials` | Material/rendering tasks | `src/docs/protocols/protocol-material.md` |

### Registered Workflows
| Workflow | Purpose |
|----------|---------|
| `boot-sequence` | Initialize agent context (T0→T4) |
| `repository-sync` | Sync with AxisRotunda/Qualia |
| `bug-fix` | Systematic bug resolution |
| `documentation-audit` | Tiered doc verification |
| `feature-implementation` | Feature development flow |

---

## 2. Auto-Approval Behavior

### ⚠️ Hardcoded Approval Guards
Certain operations **ALWAYS** require manual approval, regardless of settings:

| Operation | Always Approves? | Reason |
|-----------|------------------|--------|
| `execute_command` (with write/delete) | ✅ Yes | System safety |
| `execute_command` (npm/yarn install) | ✅ Yes | Package management |
| `execute_command` (git push) | ✅ Yes | Remote changes |
| `write_file` (overwrite existing) | ✅ Yes | Data protection |
| `replace_in_file` (destructive) | ✅ Yes | Code mutation |
| MCP filesystem (outside allowed) | ✅ Yes | Sandbox violation |

### Auto-Accept Works For
- Read operations (`read_file`, `search_files`, `list_files`)
- New file creation (`write_file` to non-existent path)
- Non-destructive edits

---

## 3. Filesystem MCP Configuration

### MCP Settings File Location

**CLINE Config Path:**
```
C:\Users\epsil\AppData\Roaming\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Project Root:**
```
C:\Users\epsil\Desktop\Qualia3D\Qualia
```

### How to Configure

The filesystem MCP server path must be configured in CLINE settings:

1. **Open VS Code Command Palette** (`Ctrl+Shift+P`)
2. Run: **"Cline: MCP Settings"**
3. Find `@modelcontextprotocol/server-filesystem`
4. Update allowed directories to:
   ```json
   ["C:\\Users\\epsil\\Desktop\\Qualia3D\\Qualia"]
   ```

### Automatic Setup

Run the universal setup script:
```powershell
node scripts/mcp-setup-universal.js
```

This will automatically:
- Detect CLINE extension
- Configure the correct settings file path
- Set the filesystem MCP to use `C:\Users\epsil\Desktop\Qualia3D\Qualia`

### Manual Settings Edit

Edit `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Users\\epsil\\Desktop\\Qualia3D\\Qualia"],
      "disabled": false
    }
  }
}
```

---

## 4. Configuration Files Summary

| File | Purpose |
|------|---------|
| `.clinerules` | Constitutional constraints for AI agent |
| `.vscode/settings.json` | VS Code/Cline extension settings |
| `.cline/skills/*.json` | Skill definitions |
| `.cline/workflows/*.json` | Workflow definitions |
| `src/docs/core/fs-manifest.json` | File operation tracking |

---

## 5. Troubleshooting

### Skills Not Appearing
1. Verify `.vscode/settings.json` exists
2. Reload VS Code window
3. Check Cline extension output panel for errors

### Commands Still Pending
1. Check if operation is in "Always Approves" list above
2. Verify `requires_approval: false` in tool calls
3. Check Cline settings for global auto-accept toggle

### MCP Filesystem Errors
1. Verify MCP server allowed directories
2. Use traditional `read_file`/`write_file` tools as fallback
3. Restart MCP server after configuration changes
