#!/usr/bin/env python3
"""
================================================================================
⚡ ATHX Cross-Machine Setup & Installation Script
================================================================================
Configures Machine 1 or Machine 2 for 1-word terminal execution (`athx`):
  1. Detects local Python virtual environment & checks dependencies.
  2. Installs `athx` launcher into ~/.local/bin/athx.
  3. Saves local repository location to ~/.config/agy/config.json.
  4. Configures shell PATH in ~/.zshrc and ~/.bashrc.
  5. Whitelists `athx` in Antigravity CLI settings (~/.gemini/antigravity-cli/settings.json).
"""

from __future__ import annotations
import os
import sys
import json
import shutil
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REQUIRED_PACKAGES = [
    ("pandas", "pandas"),
    ("googleapiclient", "google-api-python-client google-auth-oauthlib"),
    ("caldav", "caldav"),
    ("icalendar", "icalendar"),
    ("garminconnect", "garminconnect"),
    ("garth", "garth"),
]

def check_and_install_dependencies():
    print("🔍 Checking Python dependencies...")
    missing = []
    for mod, pkg in REQUIRED_PACKAGES:
        try:
            __import__(mod)
            print(f"  ✔ {mod}")
        except ImportError:
            print(f"  ✖ {mod} (missing)")
            missing.append(pkg)

    if missing:
        pkgs_str = " ".join(missing)
        print(f"\n📦 Installing missing packages ({pkgs_str})...")
        cmd = [sys.executable, "-m", "pip", "install"] + pkgs_str.split()
        res = subprocess.run(cmd)
        if res.returncode != 0:
            print("⚠️ Some packages failed to install. You may need to run manually:")
            print(f"   pip install {pkgs_str}")
    else:
        print("✅ All required Python packages are installed!")


def setup_cli_launcher():
    print("\n🔗 Setting up single-word `athx` command in ~/.local/bin...")
    home = Path.home()
    local_bin = home / ".local" / "bin"
    local_bin.mkdir(parents=True, exist_ok=True)
    target_athx = local_bin / "athx"

    # Save repository path to persistent config
    config_dir = home / ".config" / "agy"
    config_dir.mkdir(parents=True, exist_ok=True)
    config_file = config_dir / "config.json"
    with open(config_file, "w", encoding="utf-8") as f:
        json.dump({
            "agy_dir": str(BASE_DIR),
            "python_bin": sys.executable
        }, f, indent=2)
    print(f"  • Persistent config saved to: {config_file}")

    # Generate launcher script
    athx_src = BASE_DIR / "athx"
    launcher_content = f"""#!/bin/sh
exec "{sys.executable}" "{athx_src}" "$@"
"""
    with open(target_athx, "w", encoding="utf-8") as f:
        f.write(launcher_content)
    target_athx.chmod(0o755)
    print(f"  • Executable created at: {target_athx}")

    # Ensure ~/.local/bin is in PATH
    path_line = 'export PATH="$HOME/.local/bin:$PATH"'
    for rc_name in [".zshrc", ".bashrc", ".zprofile"]:
        rc = home / rc_name
        if rc.exists():
            content = rc.read_text(encoding="utf-8", errors="ignore")
            if ".local/bin" not in content:
                with open(rc, "a", encoding="utf-8") as f:
                    f.write(f"\n# Added by ATHX Orchestrator\n{path_line}\n")
                print(f"  • Added ~/.local/bin to PATH in ~/{rc_name}")


def setup_antigravity_whitelist():
    """Adds `athx` to ~/.gemini/antigravity-cli/settings.json permissions."""
    print("\n🛡️ Configuring Antigravity CLI whitelist...")
    home = Path.home()
    settings_file = home / ".gemini" / "antigravity-cli" / "settings.json"
    if not settings_file.exists():
        print("  • No Antigravity CLI settings.json found (skipping).")
        return

    try:
        with open(settings_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        if "permissions" not in data:
            data["permissions"] = {}
        allow_list = data["permissions"].get("allow", [])

        rules_to_add = [
            "command(athx)",
            f"command({home}/.local/bin/athx)",
            f"command({BASE_DIR}/athx)",
        ]

        added = 0
        for r in rules_to_add:
            if r not in allow_list:
                allow_list.append(r)
                added += 1

        if added > 0:
            data["permissions"]["allow"] = allow_list
            with open(settings_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            print(f"  • Whitelisted {added} `athx` command rules in settings.json")
        else:
            print("  • `athx` is already whitelisted in settings.json")
    except Exception as e:
        print(f"  ⚠️ Could not update settings.json: {e}")


def main():
    print("================================================================================")
    print("⚡ ATHX 2027 • CROSS-MACHINE CLI SETUP")
    print("================================================================================")
    print(f"Directory : {BASE_DIR}")
    print(f"Python    : {sys.executable}\n")

    check_and_install_dependencies()
    setup_cli_launcher()
    setup_antigravity_whitelist()

    print("\n================================================================================")
    print("✨ Setup Complete! You can now launch ATHX from ANY directory:")
    print("   $ athx")
    print("================================================================================\n")


if __name__ == "__main__":
    main()
