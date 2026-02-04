# Protocol: Git Repository Synchronization
> **Scope**: Agent automation of repository sync handling.
> **Source**: `../kernel.md`
> **Version**: 2.0 (Updated for AxisRotunda/Qualia target)

## 1. INTRODUCTION

This protocol defines the automated synchronization workflow for pushing all project commits to the **AxisRotunda/Qualia** repository on the `dev` branch. The system uses a Personal Access Token (PAT) stored in a local `.env` file for authentication.

## 2. REMOTE CONFIGURATION

| Remote | URL | Purpose |
|--------|-----|---------|
| `target` | `https://github.com/AxisRotunda/Qualia.git` | **Primary push target** - all commits go here |
| `upstream` | `https://github.com/AxisRotunda/Qualia.git` | Pull source (same repo, main branch) |
| `origin` | `https://github.com/Seterak/Qualia.git` | Legacy fork (no longer used for pushes) |

### Target Configuration
- **Repository**: `https://github.com/AxisRotunda/Qualia.git`
- **Branch**: `dev`
- **Authentication**: GitHub Personal Access Token (stored in `.env`)

## 3. ENVIRONMENT CONFIGURATION

Create a `.env` file in the project root:

```bash
# GitHub Personal Access Token
# Must have 'repo' scope for private repositories
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Target repository (default: AxisRotunda/Qualia)
TARGET_REPO_URL=https://github.com/AxisRotunda/Qualia.git
TARGET_BRANCH=dev
```

**Security Notes**:
- `.env` file is listed in `.gitignore` and should NEVER be committed
- Token should have minimal required permissions (`repo` scope)
- Rotate tokens periodically for security

## 4. SYNC STATES

| State | Description | Action Required |
|-------|-------------|-----------------|
| `SYNCED` | Local and target aligned | None |
| `AHEAD` | Local ahead of target | Push to target |
| `BEHIND_TARGET` | Target has new commits | Pull/merge required |
| `DIVERGED` | Local and target diverged | Manual resolution required |
| `DIRTY` | Working tree has uncommitted changes | Commit or stash first |
| `NO_TOKEN` | GITHUB_TOKEN not found in .env | Configure .env file |

## 5. AUTOMATION WORKFLOW

### 5.1 Pre-Sync Validation
```
1. Check .env file exists and contains GITHUB_TOKEN
2. Verify working tree is clean
3. Configure 'target' remote to AxisRotunda/Qualia
4. Fetch from target repository
5. Calculate sync state matrix
```

### 5.2 Sync Matrix Calculation
```typescript
interface SyncState {
  branch: string;           // Current local branch
  targetBranch: string;     // Target branch (dev)
  localHash: string;        // HEAD commit hash
  targetHash: string;       // target/dev hash
  upstreamHash: string;     // upstream/main hash
  state: 'SYNCED' | 'AHEAD' | 'BEHIND_TARGET' | 'DIVERGED' | 'NO_TOKEN';
  aheadCount: number;       // Commits ahead of target
  behindCount: number;      // Commits behind target
}
```

### 5.3 Automated Actions
| Condition | Action | Command |
|-----------|--------|---------|
| NO_TOKEN | Abort with error message | - |
| Working tree dirty | Abort with warning | - |
| Behind target | Report divergence | Manual merge required |
| Ahead of target | Push to target | `git push <auth-url> HEAD:dev` |

## 6. AGENT COMMANDS

### 6.1 `SYNC_REPO --check`
Performs read-only sync state assessment.
**Output**: SyncState report
**Exit Code**: 0 if SYNCED, 1 otherwise

### 6.2 `SYNC_REPO --pull`
Syncs from upstream to local.
**Prerequisite**: Working tree clean
**Steps**:
1. `git fetch upstream`
2. `git merge --ff-only upstream/main`

### 6.3 `SYNC_REPO --push`
Pushes local to target (AxisRotunda/Qualia dev branch).
**Prerequisite**: 
- Working tree clean
- GITHUB_TOKEN configured in .env
**Steps**:
1. Configure target remote
2. `git push https://TOKEN@github.com/AxisRotunda/Qualia.git HEAD:dev`

### 6.4 `SYNC_REPO --full`
Complete synchronization cycle.
**Steps**:
1. `--check` - Validate state and token
2. `--push` - Push to AxisRotunda/Qualia dev branch

## 7. SAFETY GUARDRAILS

| Guard | Implementation |
|-------|----------------|
| Token validation | Pre-push check for GITHUB_TOKEN |
| Dirty tree prevention | Pre-sync `git status` check |
| Protected branch | Always pushes to `dev` branch |
| Credential exposure | Token only used in URL during push, not stored in remote config |
| .env protection | `.env` listed in `.gitignore` |

## 8. ERROR HANDLING

| Error | Recovery |
|-------|----------|
| NO_TOKEN | Create `.env` file with valid GITHUB_TOKEN |
| 403/Unauthorized | Check token validity and permissions |
| Network failure | Retry with exponential backoff |
| Diverged history | Manual merge required |
| Permission denied | Verify write access to AxisRotunda/Qualia |

## 9. MIGRATION FROM LEGACY SETUP

### Previous Configuration
- Pushes went to: `Seterak/Qualia` (origin)
- Pulls came from: `AxisRotunda/Qualia` (upstream)

### New Configuration
- All pushes go to: `AxisRotunda/Qualia` (target remote, dev branch)
- Legacy origin remote is ignored by automation

### Migration Steps
1. Create `.env` file with GITHUB_TOKEN
2. Run `node scripts/git-sync.cjs --check` to verify
3. Run `node scripts/git-sync.cjs --full` to push to new target

## 10. INTEGRATION WITH KERNEL

This protocol extends the Agent Workflow (Axial 0.2):
- Trigger: Pre-session `BOOT` phase
- Log: `src/docs/history/memory.md`
- Manifest: Update `fs-manifest.json` for structural changes

## 11. CHANGELOG

| Version | Date | Change |
|---------|------|--------|
| 2.0 | 2026-02-04 | Updated to push all commits to AxisRotunda/Qualia dev branch |
| 1.0 | 2026-02-04 | Initial protocol definition (origin/seterak target) |
