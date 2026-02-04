# [T1] Development Environment
> **Scope**: Local development setup for Windows 11 + VS Code + CLINE
> **Source**: `src/docs/kernel.md`
> **Audience**: AI Agents + Developers
> **Version**: 1.0.0

---

## 1. SYSTEM REQUIREMENTS

### 1.1 Hardware Prerequisites
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Windows 11 21H2+ | Windows 11 24H2 |
| RAM | 8 GB | 16 GB |
| GPU | WebGL 2.0 compatible | Dedicated GPU (GTX 1060+) |
| Storage | 2 GB free | SSD with 5 GB free |
| Node.js | 18.0.0 | 20.x LTS |

### 1.2 Required Software
```powershell
# Verify installations
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
git --version     # >= 2.40.0
code --version    # VS Code CLI
```

---

## 2. WINDOWS 11 SETUP

### 2.1 Node.js Installation (nvm-windows recommended)
```powershell
# Install nvm-windows
winget install CoreyButler.NVMforWindows

# Install and use Node 20 LTS
nvm install 20.18.0
nvm use 20.18.0

# Verify
node --version  # v20.18.0
npm --version   # 10.x.x
```

### 2.2 Git Configuration (Dual Remote Setup)
```powershell
# Global config
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main

# Qualia-specific: Configure remotes
git remote add origin https://github.com/Seterak/Qualia.git
git remote add target https://github.com/AxisRotunda/Qualia.git
git remote add upstream https://github.com/AxisRotunda/Qualia.git

# Verify remotes
git remote -v
```

### 2.3 Windows Developer Settings
```powershell
# Enable Developer Mode (for symlink support)
# Settings > Privacy & Security > For Developers > Developer Mode: ON

# Enable Long Path Support
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

---

## 3. VS CODE CONFIGURATION

### 3.1 Required Extensions
| Extension | ID | Purpose |
|-----------|-----|---------|
| CLINE | `saoudrizwan.claude-dev` | AI Agent Interface |
| Angular Language Service | `Angular.ng-template` | Angular template support |
| TypeScript Importer | `pmneo.tsimporter` | Auto-imports |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | Tailwind autocomplete |
| ESLint | `dbaeumer.vscode-eslint` | Linting |
| Prettier | `esbenp.prettier-vscode` | Code formatting |
| GitLens | `eamodio.gitlens` | Git visualization |
| Import Cost | `wix.vscode-import-cost` | Bundle size tracking |
| Three.js Snippets | `cancerberosgx.vscode-threejs-snippets` | Three.js helpers |
| Rust Analyzer | `rust-lang.rust-analyzer` | For Rapier WASM debugging |

### 3.2 VS Code Settings (Workspace)
Location: `.vscode/settings.json`
```json
{
  "roo.code": {
    "skills": {
      "globalPath": ".cline/skills",
      "workspacePath": ".cline/skills"
    },
    "workflows": {
      "globalPath": ".cline/workflows",
      "workspacePath": ".cline/workflows"
    }
  },
  "cline": {
    "skillsPath": ".cline/skills",
    "workflowsPath": ".cline/workflows"
  },
  "roo-cline.multiplierSettings": {
    "customInstructions": "See .clinerules for project-specific constitutional constraints"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

---

## 4. CLINE/ROO CODE SETUP

### 4.1 Extension Installation
1. Open VS Code
2. Extensions panel (`Ctrl+Shift+X`)
3. Search: "Cline"
4. Install: `saoudrizwan.claude-dev`

### 4.2 MCP Server Configuration
Location: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

**Configuration:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\epsil\\Desktop\\Qualia3D\\Qualia"
      ],
      "disabled": false
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_TOKEN}"
      },
      "disabled": false
    },
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ],
      "disabled": true
    }
  }
}
```

**To apply:**
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run: `Cline: MCP Settings`
3. Paste configuration above
4. Restart VS Code

### 4.3 Auto-Approval Configuration
In CLINE settings (sidebar), configure:
- ✅ Auto-accept read operations
- ✅ Auto-accept file searches
- ⚠️ Manual approval for: write operations, terminal commands, git push

---

## 5. PROJECT SETUP

### 5.1 Initial Clone & Install
```powershell
# Clone repository
git clone https://github.com/Seterak/Qualia.git
cd Qualia

# Install dependencies
npm install

# Verify installation
npm run type-check
```

### 5.2 Environment Configuration
Create `.env` file in project root:
```env
# GitHub Token for repository sync
# Generate at: https://github.com/settings/tokens
# Required scopes: repo
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Optional: Development flags
NODE_ENV=development
DEBUG=true
```

**Security Note:** `.env` is in `.gitignore` - never commit this file.

### 5.3 Development Scripts
```powershell
# Start development server
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Code formatting
npm run format

# Linting
npm run lint
```

---

## 6. TROUBLESHOOTING

### 6.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `ng serve` fails | Node version mismatch | Use nvm to switch to Node 20 |
| WASM errors | Physics NaN/Infinity | Check `Number.isFinite()` guards |
| Import errors | Path aliases | Verify `tsconfig.json` paths |
| MCP filesystem errors | Wrong allowed directory | Update MCP settings (see 4.2) |
| Git sync fails | Missing GITHUB_TOKEN | Create `.env` with token |

### 6.2 CLINE-Specific Issues

**Skills Not Appearing:**
```powershell
# Verify file structure exists
Test-Path .cline/skills/repository-management.json
Test-Path .cline/workflows/boot-sequence.json

# Reload VS Code window
# Command Palette: "Developer: Reload Window"
```

**MCP Server Connection Failed:**
```powershell
# Check npx is available
npx --version

# Verify Node path in VS Code
# Settings > Terminal > Integrated > Env: Windows
```

### 6.3 Windows-Specific Issues

**Long Path Errors:**
```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

**PowerShell Execution Policy:**
```powershell
# Allow local scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 7. DEVELOPMENT WORKFLOW

### 7.1 Daily Workflow
```powershell
# 1. Start of day - sync repository
node scripts/git-sync.cjs

# 2. Start dev server
npm run dev

# 3. Open browser to http://localhost:3000
```

### 7.2 Agent-Assisted Workflow
1. **Boot**: CLINE automatically runs WF_BOOT on session start
2. **Command**: Use commands like `RUN_PHYS`, `SYNC_REPO`, `RUN_KNOWLEDGE`
3. **Review**: Always review changes before approving
4. **Sync**: Run `SYNC_REPO` to push changes

---

## 8. VALIDATION CHECKLIST

Before starting development:
- [ ] Node.js 20.x installed (`node --version`)
- [ ] Dependencies installed (`npm install` completed)
- [ ] `.env` file created with `GITHUB_TOKEN`
- [ ] VS Code extensions installed
- [ ] Roo Code extension configured
- [ ] MCP filesystem path corrected to Qualia directory
- [ ] Git remotes configured (origin, target, upstream)
- [ ] `npm run dev` starts without errors
- [ ] Browser shows app at `http://localhost:3000`

---

## 9. RELATED DOCUMENTATION

| Document | Purpose |
|----------|---------|
| [CLINE Configuration](./CLINE_CONFIGURATION.md) | Detailed CLINE setup |
| [MCP Registry](./mcp-registry.md) | MCP server catalog |
| [Knowledge Graph](./knowledge-graph.md) | System dependencies |
| [Kernel](../kernel.md) | Constitutional constraints |

---

*Environment configuration is critical for consistent AI agent behavior. Report issues in `src/docs/history/repair-logs/`.*