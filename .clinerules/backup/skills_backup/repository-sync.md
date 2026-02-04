# Skill: Repository Sync

Automate repository synchronization with AxisRotunda/Qualia.

## Trigger
`SYNC_REPO` or mention "sync repository"

## Prerequisites

- `.env` file with `GITHUB_TOKEN`
- Token has push access to https://github.com/AxisRotunda/Qualia

## Execution Steps

1. **Token Validation**: Verify GITHUB_TOKEN is set
2. **State Check**:
   - Check `git status`
   - Check `git log` for commits to push
   - Calculate sync state matrix
3. **Target Verification**: Confirm 'target' remote points to AxisRotunda/Qualia
4. **Sync Execution**:
   - If AHEAD: Push to target
   - If BEHIND: Report for manual merge
   - If SYNCED: Confirm alignment
5. **Logging**: Record result in `memory.md`

## Script Entry Point

`scripts/git-sync.cjs`
