# Protocol: Git Repository Synchronization
> **Scope**: Agent automation of repository sync handling.
> **Source**: `../kernel.md`
> **Version**: 1.0 (Initial Implementation)

## 1. INTRODUCTION

This protocol defines the automated synchronization workflow between the local repository, origin (fork), and upstream (source) remotes. Ensures consistent state across all repository nodes and prevents drift.

## 2. REMOTE CONFIGURATION

| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | `https://github.com/Seterak/Qualia.git` | Personal fork - push target |
| `upstream` | `https://github.com/AxisRotunda/Qualia.git` | Source repository - pull source |

## 3. SYNC STATES

| State | Description | Action Required |
|-------|-------------|-----------------|
| `SYNCED` | All remotes aligned | None |
| `AHEAD` | Local ahead of origin | Push to origin |
| `BEHIND_UPSTREAM` | Upstream has new commits | Pull from upstream |
| `DIVERGED` | Local and upstream diverged | Manual resolution required |
| `UNTRACKED` | New files not in `.gitignore` | Review and commit or ignore |

## 4. AUTOMATION WORKFLOW

### 4.1 Pre-Sync Validation
```
1. Check working tree is clean
2. Verify remote connectivity
3. Fetch all remotes (no-merge)
4. Calculate sync state matrix
```

### 4.2 Sync Matrix Calculation
```typescript
interface SyncState {
  local: string;      // HEAD commit hash
  origin: string;     // origin/main hash
  upstream: string;   // upstream/main hash
  state: 'SYNCED' | 'AHEAD' | 'BEHIND_UPSTREAM' | 'DIVERGED';
  aheadCount: number; // Commits ahead of upstream
  behindCount: number;// Commits behind upstream
}
```

### 4.3 Automated Actions
| Condition | Action | Command |
|-----------|--------|---------|
| Working tree dirty | Abort with warning | - |
| Behind upstream | Fast-forward merge | `git merge --ff-only upstream/main` |
| Ahead of origin | Push to origin | `git push origin main` |
| Diverged | Create merge branch | `git checkout -b sync/YYYY-MM-DD` |

## 5. AGENT COMMANDS

### 5.1 `SYNC_REPO --check`
Performs read-only sync state assessment.
**Output**: SyncState report

### 5.2 `SYNC_REPO --pull`
Syncs from upstream to local.
**Prerequisite**: Working tree clean, no divergence
**Steps**:
1. `git fetch upstream`
2. `git merge --ff-only upstream/main`

### 5.3 `SYNC_REPO --push`
Pushes local to origin.
**Prerequisite**: Working tree clean
**Steps**:
1. `git push origin main`

### 5.4 `SYNC_REPO --full`
Complete synchronization cycle.
**Steps**:
1. `--check` - Validate state
2. `--pull` - Update from upstream
3. `--push` - Publish to origin

## 6. SAFETY GUARDRAILS

| Guard | Implementation |
|-------|----------------|
| Dirty tree prevention | Pre-sync `git status` check |
| Force push protection | `--force-with-lease` only |
| Divergence detection | Three-way compare before merge |
| Backup branch | Auto-create `backup/pre-sync-[timestamp]` |

## 7. ERROR HANDLING

| Error | Recovery |
|-------|----------|
| Network failure | Retry with exponential backoff |
| Merge conflict | Abort, create conflict report |
| Permission denied | Report to user for auth refresh |
| Upstream deleted | Alert user, preserve local state |

## 8. INTEGRATION WITH KERNEL

This protocol extends the Agent Workflow (Axial 0.2):
- Trigger: Pre-session `BOOT` phase
- Log: `src/docs/history/memory.md`
- Manifest: Update `fs-manifest.json` for structural changes

## 9. CHANGELOG

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-04 | Initial protocol definition |
