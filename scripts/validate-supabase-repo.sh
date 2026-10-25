#!/usr/bin/env bash
set -euo pipefail

CONFIG="supabase/config.toml"
test -f "$CONFIG" || { echo "Missing $CONFIG"; exit 1; }
grep -Eq '^project_id = "yfhbokrybbcbxgafjdhi"$' "$CONFIG" || {
  echo "Unexpected Supabase project_id in $CONFIG"; exit 1;
}

declare -A seen=()
count=0
while IFS= read -r -d '' file; do
  base="$(basename "$file")"
  if [[ ! "$base" =~ ^([0-9]{14})_[a-z0-9_]+\.sql$ ]]; then
    echo "Invalid migration filename: $file"
    exit 1
  fi
  version="${BASH_REMATCH[1]}"
  if [[ -n "${seen[$version]:-}" ]]; then
    echo "Duplicate migration version $version: ${seen[$version]} and $file"
    exit 1
  fi
  seen[$version]="$file"
  count=$((count + 1))
done < <(find supabase/migrations -maxdepth 1 -type f -name '*.sql' -print0 | sort -z)

test "$count" -gt 0 || { echo "No SQL migrations found"; exit 1; }

for fn in submit-registration send-whatsapp-registration create-registrant-account manage-registrant-account; do
  test -s "supabase/functions/$fn/index.ts" || {
    echo "Missing active Edge Function source: $fn"
    exit 1
  }
done

echo "Validation passed: $count migration file(s), expected project ref, and all four function entrypoints exist."
echo "This script validates repository structure only; it does not deploy to Supabase."
