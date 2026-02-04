# Repository Sync Workflow

Automate repository synchronization with proper state checking.

## Steps

1. **Token Validation**: Verify `.env` contains GITHUB_TOKEN, check permissions
2. **State Check**:
   - `git status`: Verify working tree clean
   - `git log`: Check commits to push
   - Calculate sync state matrix
3. **Target Configuration**: Verify 'target' remote points to AxisRotunda/Qualia, confirm 'dev' branch
4. **Sync Execution**:
   - If AHEAD: Push to target
   - If BEHIND: Report for manual merge
   - If SYNCED: Confirm alignment
5. **Logging**: Record sync result in `memory.md`

## Environment Requirements

- `.env` file with `GITHUB_TOKEN`
- Token has push access to: https://github.com/AxisRotunda/Qualia
- Required scopes: repo

## Script Entry Point

`scripts/git-sync.cjs`
