#!/bin/sh
# Usage: ./bump-version.sh 2026-11-08a  – sets the app version in index.html and version.json together.
set -e
v="$1"; [ -n "$v" ] || { echo "usage: $0 <version>"; exit 1; }
sed -i "s/const APP_VER=\"[^\"]*\";/const APP_VER=\"$v\";/" index.html
printf '{"version":"%s"}\n' "$v" > version.json
grep -o "const APP_VER=\"[^\"]*\"" index.html; cat version.json
