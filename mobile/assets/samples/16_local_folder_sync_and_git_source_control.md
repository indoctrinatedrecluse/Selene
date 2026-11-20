# ⚡ Local Folder Binding & Integrated Git Source Control

Selene delivers high-productivity **Native Desktop Power Features** designed for engineers who work directly with local repositories, documentation trees, and production pipelines.

> [!NOTE]
> 🚀 **Desktop Power Capabilities**:
> - **Local Folder Binding**: Mount external directories via the HTML5 File System Access API. Edits in Selene automatically flush to your local disk in real time.
> - **Git Source Control Drawer**: Track staged and unstaged file modifications, author atomic commits (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>), review visual unified diffs, and push changes to remote origins.
> - **Collapsible Command Runner**: Built-in shell tray (<kbd>Ctrl</kbd>+<kbd>`</kbd>) to run unit tests, build commands, and Git CLI workflows without leaving your editing canvas.

---

## 📂 1. Two-Way Local Disk Synchronization

To bind a local folder:
1. In the **Workspace Sidebar**, click the folder mount button: **"Mount Local Directory"**.
2. Select any local folder (e.g., your project's `docs/` directory or repository root).
3. Any changes you make inside Selene immediately stream to your local file system, and external edits reload seamlessly.

---

## 🌿 2. Integrated Git Source Control Drawer

Click the **Git Source** tab in the sidebar (or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>G</kbd>) to open the Git Source Control Drawer:
- **Status Badges**: Visual indicators for modified (`M`), added (`A`), and untracked (`U`) files.
- **Stage / Unstage All**: 1-click staging of document changes.
- **Visual Diff Inspector**: Inspect colored side-by-side and unified diffs before finalizing your commits.
- **Commit Authoring**: Enter commit summaries with full multi-line commit message support.

---

## 💻 3. Collapsible Command Runner & Shell Tray

Press <kbd>Ctrl</kbd>+<kbd>`</kbd> (or click **Shell Tray** in the bottom footer) to expand the bottom terminal drawer:
- **Preset Task Runners**: Instant buttons for `npm test`, `git status`, and `npm run build`.
- **Arbitrary Command Execution**: Enter any shell command directly with ANSI colored output formatting.
- **Execution Telemetry**: Badges indicating execution time and process exit codes (0 for success, non-zero for failures).

```bash
# Run tests directly from the Selene Command Runner
npm test -- --coverage
git status --short
```
