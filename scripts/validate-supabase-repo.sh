#!/usr/bin/env bash
set -euo pipefail
CONFIG="supabase/config.toml"
test -f "$CONFIG" || { echo "Missing $CONFIG"; exit 1; }
grep -Eq '^project_id = "yfhbokrybbcbxgafjdhi"$' "$CONFIG" || { echo "Unexpected Supabase project_id in $CONFIG"; exit 1; }
python3 - <<'PY'
from pathlib import Path
import re
files = sorted(Path("supabase/migrations").glob("*.sql"))
if not files:
    raise SystemExit("No SQL migrations found")
seen = {}
for path in files:
    match = re.fullmatch(r"([0-9]{14})_[A-Za-z0-9_-]+\.sql", path.name)
    if not match:
        raise SystemExit(f"Invalid migration filename: {path}")
    version = match.group(1)
    if version in seen:
        raise SystemExit(f"Duplicate migration version {version}: {seen[version]} and {path}")
    seen[version] = path
print(f"Valid migration filenames: {len(files)}")
PY
for fn in submit-registration send-whatsapp-registration create-registrant-account manage-registrant-account; do
  test -s "supabase/functions/$fn/index.ts" || { echo "Missing active Edge Function source: $fn"; exit 1; }
done
echo "Validation passed: expected project ref and all four active function entrypoints exist."
echo "This script validates repository structure only; it does not deploy to Supabase."
