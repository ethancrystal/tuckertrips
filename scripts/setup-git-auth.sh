#!/usr/bin/env bash
# Configure git authentication using GITHUB_PERSONAL_ACCESS_TOKEN.
# Run this script once per session (or from .bashrc / workflow startup).
set -euo pipefail

if [[ -z "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN is not set." >&2
  exit 1
fi

CREDS_FILE="/tmp/.git-credentials"
echo "https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com" > "$CREDS_FILE"
chmod 600 "$CREDS_FILE"

git config credential.helper "store --file ${CREDS_FILE}"
git config user.name "moibftj"
git config user.email "moizjmj@outlook.com"

echo "Git authentication configured successfully."
