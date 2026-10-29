#!/usr/bin/env python3
"""
ATHX Garmin Watch Face Builder & Manager
Automates checking prerequisites, generating developer keys, and compiling for Garmin Venu 3.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DEV_KEY = BASE_DIR / "developer_key.der"
BIN_DIR = BASE_DIR / "bin"
TARGET_DEVICE = "venu3"

def check_environment():
    print("=" * 60)
    print("⚡ ATHX CONNECT IQ BUILD MANAGER • GARMIN VENU 3")
    print("=" * 60)

    # 1. Check Java
    java_path = shutil.which("java")
    if java_path:
        print(f"✅ Java Runtime detected: {java_path}")
    else:
        print("⚠️ Java Runtime not found in PATH.")
        print("   -> Install Java via Homebrew: brew install openjdk@17")

    # 2. Check Monkey C compiler
    monkeyc_path = shutil.which("monkeyc")
    if monkeyc_path:
        print(f"✅ Monkey C Compiler detected: {monkeyc_path}")
    else:
        print("ℹ️ 'monkeyc' CLI not found in PATH.")
        print("   -> You can build directly inside Visual Studio Code using the Garmin Monkey C extension:")
        print("      Press Cmd+Shift+P -> 'Monkey C: Build for Device' -> Select 'venu3'")

    # 3. Check or generate Developer Key
    if DEV_KEY.exists():
        print(f"✅ Developer Key found: {DEV_KEY}")
    else:
        print(f"ℹ️ Developer Key not found at {DEV_KEY}.")
        print("   -> In VS Code: Cmd+Shift+P -> 'Monkey C: Generate a Developer Key' and save here.")

def generate_dev_key():
    """Generates an RSA 4096-bit DER developer key using openssl if available."""
    if DEV_KEY.exists():
        print(f"Developer key already exists at {DEV_KEY}")
        return True

    openssl = shutil.which("openssl")
    if not openssl:
        print("OpenSSL not found; please generate the key inside VS Code via Monkey C extension.")
        return False

    try:
        tmp_pem = BASE_DIR / "developer_key.pem"
        subprocess.run([openssl, "genrsa", "-out", str(tmp_pem), "4096"], check=True)
        subprocess.run([openssl, "pkcs8", "-topk8", "-inform", "PEM", "-outform", "DER", "-in", str(tmp_pem), "-out", str(DEV_KEY), "-nocrypt"], check=True)
        tmp_pem.unlink(missing_ok=True)
        print(f"✅ Generated 4096-bit RSA Developer Key: {DEV_KEY}")
        return True
    except Exception as e:
        print(f"Could not generate developer key via OpenSSL: {e}")
        return False

def build_binary():
    monkeyc = shutil.which("monkeyc")
    if not monkeyc:
        print("\n[!] To compile the binary:")
        print("    1. Open this folder in VS Code (`code .`)")
        print("    2. Ensure the 'Monkey C' extension is installed.")
        print("    3. Press `Cmd + Shift + P` and choose: 'Monkey C: Build for Device'")
        print(f"    4. Select '{TARGET_DEVICE}' and output to '{BIN_DIR}/athx_venu3.prg'")
        return

    BIN_DIR.mkdir(exist_ok=True)
    out_prg = BIN_DIR / f"athx_{TARGET_DEVICE}.prg"

    cmd = [
        monkeyc,
        "-d", TARGET_DEVICE,
        "-f", str(BASE_DIR / "monkey.jungle"),
        "-o", str(out_prg),
        "-y", str(DEV_KEY),
        "-w"
    ]
    print(f"\nBuilding {out_prg}...")
    try:
        subprocess.run(cmd, check=True)
        print(f"\n🎉 Successfully compiled ATHX Watch Face binary:")
        print(f"   -> {out_prg}")
        print("\nSideload onto Garmin Venu 3:")
        print("   1. Connect Venu 3 to Mac via USB (using OpenMTP / Android File Transfer).")
        print("   2. Drag 'athx_venu3.prg' into the '/GARMIN/APPS/' directory on the watch.")
        print("   3. Disconnect watch -> Go to Settings -> Watch Face -> Select 'ATHX Mission Control'!")
    except subprocess.CalledProcessError as e:
        print(f"Compilation failed with exit code {e.returncode}")

if __name__ == "__main__":
    check_environment()
    generate_dev_key()
    if len(sys.argv) > 1 and sys.argv[1] == "build":
        build_binary()
