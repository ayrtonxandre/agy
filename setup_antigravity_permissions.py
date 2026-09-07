#!/usr/bin/env python3
"""
Antigravity Permission Setup Utility.
Configures ~/.gemini/antigravity-cli/settings.json with:
1. Standard CLI utilities (git, uv, python, ls, cat, etc.)
2. Active virtual environment binaries (both relative and absolute)
Works seamlessly across macOS, Linux, and Windows.
"""
from __future__ import annotations
import os
import sys
import json
import shutil
from pathlib import Path

STANDARD_TOOLS = [
    # Navigation & Directory Inspection
    "command(ls)",
    "command(pwd)",
    "command(which)",
    "command(echo)",
    "command(find)",
    "command(tree)",
    # Text & File Inspection
    "command(cat)",
    "command(head)",
    "command(tail)",
    "command(grep)",
    "command(wc)",
    "command(diff)",
    "command(sed)",
    "command(awk)",
    "command(strings)",
    # File Operations
    "command(cp)",
    "command(mv)",
    "command(mkdir)",
    "command(touch)",
    "command(unzip)",
    "command(tar)",
    # Version Control
    "command(git)",
    # Runtimes & Package Managers
    "command(python)",
    "command(python3)",
    "command(uv)",
    # System Diagnostics
    "command(ps)",
    "command(lsof)",
    "command(df)",
    "command(du)",
    "command(open)",
]

def main():
    home = Path.home()
    settings_dir = home / ".gemini" / "antigravity-cli"
    settings_file = settings_dir / "settings.json"
    backup_file = settings_dir / "settings.json.bak"

    if not settings_dir.exists():
        settings_dir.mkdir(parents=True, exist_ok=True)

    data = {}
    if settings_file.exists():
        try:
            with open(settings_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            shutil.copy2(settings_file, backup_file)
            print(f"📦 Backup created at: {backup_file}")
        except Exception as e:
            print(f"⚠️ Could not parse existing settings.json: {e}")
            data = {}

    if "permissions" not in data:
        data["permissions"] = {}
    existing_allow = data["permissions"].get("allow", [])

    # Detect current Python executable and its virtualenv
    venv_python = str(Path(sys.executable).resolve())
    venv_dir = Path(venv_python).parent
    venv_pip = str((venv_dir / ("pip" if os.name != "nt" else "pip.exe")).resolve())

    dynamic_commands = [
        f"command({venv_python})",
        f"command({venv_pip})",
        "command(./.venv/bin/python)",
        "command(./.venv/bin/pip)",
        "command(.\\.venv\\Scripts\\python.exe)",
        "command(.\\.venv\\Scripts\\pip.exe)",
    ]

    merged = []
    seen = set()

    for item in STANDARD_TOOLS + dynamic_commands + existing_allow:
        if item not in seen:
            seen.add(item)
            merged.append(item)

    data["permissions"]["allow"] = merged

    with open(settings_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    # Also copy AGENTS.md to user's home directory if not present
    local_agents_md = Path(__file__).parent / "AGENTS.md"
    home_agents_md = home / "AGENTS.md"
    if local_agents_md.exists():
        if not home_agents_md.exists():
            shutil.copy2(local_agents_md, home_agents_md)
            print(f"📋 Copied global workspace rules to: {home_agents_md}")
        else:
            print(f"ℹ️ Global rules file already exists at: {home_agents_md}")

    print(f"✅ Successfully updated {settings_file}")
    print(f"   • Total whitelisted rules: {len(merged)}")
    print(f"   • Machine Python path: {venv_python}")
    print(f"   • Relative venv paths added: ./.venv/bin/python, .\\.venv\\Scripts\\python.exe")
    print("\n⚡ Important: Restart your Antigravity session (`agy`) for changes to take effect!")

if __name__ == "__main__":
    main()
