# Antigravity Rules & Execution Policy

## 1. Command Execution & Friction Reduction
- **Never Run Multiline Python via `python -c`**:
  - Antigravity's permission manager and grant store reject multiline command strings (`invalid grant string`).
  - Executing logic via multiline `python -c '...'` causes repeated interactive permission prompts on every single run, even if the user clicks "Always allow".
  - **Always write executable logic to dedicated `.py` script files** (or session scratch scripts) and execute them as clean, single-line commands:
    ```bash
    /Users/ayrton.andre/Documents/work/.venv/bin/python script.py [args]
    ```

- **Avoid Compound Command Chaining (`&&`, `;`, `|`)**:
  - Antigravity's security parser treats chained shell commands as unverified composite execution.
  - Chaining commands (e.g. `cmd1 && cmd2` or `cmd1; cmd2`) breaks whitelist matching and triggers manual user confirmation modals.
  - Always execute individual commands sequentially as separate tool calls.

- **Prefer Native Agent Tools Over Shell Calls for Inspection**:
  - For reading files, searching code, and checking directories, always use Antigravity's built-in tools (`view_file`, `list_dir`, `find_by_name`, `grep_search`).
  - Native tools never surface permission confirmation modals.

## 2. Environment & Binaries
- The designated Python virtual environment for this project is:
  `/Users/ayrton.andre/Documents/work/.venv/bin/python`
- The virtualenv binaries (`python`, `pip`) are whitelisted in `~/.gemini/antigravity-cli/settings.json`.
