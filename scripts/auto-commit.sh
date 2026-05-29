#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: auto-commit.sh [options]

Options:
  -m, --message <msg>   Custom commit message
  --push                Push to origin/<current-branch> after committing
  -h, --help            Show this help message
USAGE
}

MESSAGE=""
PUSH=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message)
      if [[ $# -lt 2 ]]; then
        echo "Error: --message requires an argument" >&2
        usage
        exit 1
      fi
      MESSAGE="$2"
      shift 2
      ;;
    --push)
      PUSH=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$MESSAGE" ]]; then
  MESSAGE="chore: auto commit $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
fi

if git status --short --untracked-files=normal | grep -q .; then
  echo "Staging changes..."
  git add -A
  echo "Committing with message: $MESSAGE"
  git commit -m "$MESSAGE"
  if [[ "$PUSH" == true ]]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "Pushing to origin/$CURRENT_BRANCH"
    if [[ -n "${GITHUB_PERSONAL_ACCESS_TOKEN:-}" ]]; then
      ORIGIN_URL=$(git remote get-url origin)
      REPO_URL=$(echo "$ORIGIN_URL" | sed 's|https://|https://'"${GITHUB_PERSONAL_ACCESS_TOKEN}"'@|')
      GIT_ASKPASS=/bin/true GIT_TERMINAL_PROMPT=0 git -c credential.helper="" push "$REPO_URL" "HEAD:${CURRENT_BRANCH}"
    else
      echo "Warning: GITHUB_PERSONAL_ACCESS_TOKEN not set, falling back to default git push" >&2
      git push origin "$CURRENT_BRANCH"
    fi
    echo "Push successful."
  else
    echo "Commit created (push skipped)"
  fi
else
  echo "Nothing to commit. Working tree clean."
fi
