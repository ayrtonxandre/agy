#!/bin/sh
set -e

DATA_DIR="${AGY_DATA_DIR:-/app/data}"
mkdir -p "$DATA_DIR"

echo "=========================================================="
echo "🚀 Initializing ATHX 2027 / AGY Container Environment"
echo "   Data Directory: $DATA_DIR"
echo "   Timezone:       ${TZ:-Europe/Paris}"
echo "   Port:           ${PORT:-8080}"
echo "=========================================================="

# 1. Seed initial datasets and dashboards into DATA_DIR if missing
if [ -d "/app/seed" ]; then
    for item in /app/seed/*; do
        [ -e "$item" ] || continue
        name=$(basename "$item")
        if [ ! -e "$DATA_DIR/$name" ]; then
            echo "   [Seed] Initializing $name into $DATA_DIR"
            cp -r "$item" "$DATA_DIR/$name"
        fi
    done
fi

# 2. Maintain backwards compatibility: symlink persistent items in DATA_DIR back to /app
for item in "$DATA_DIR"/*; do
    [ -e "$item" ] || continue
    name=$(basename "$item")
    if [ ! -e "/app/$name" ] || [ -L "/app/$name" ]; then
        ln -sf "$item" "/app/$name"
    fi
done

# 3. Ensure athlete dashboards exist; compile if missing
if [ ! -f "$DATA_DIR/garmin_workout.html" ] && [ -f "/app/generate_unified_athlete_dashboard.py" ]; then
    echo "   [Build] Compiling initial ATHX Athlete Dashboard..."
    python3 /app/generate_unified_athlete_dashboard.py || echo "   [Warning] Initial dashboard build skipped or had errors"
fi

echo "=========================================================="
echo "✔ Environment ready. Launching application process..."
echo "=========================================================="

exec "$@"
