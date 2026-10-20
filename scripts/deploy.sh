#!/usr/bin/env bash
# Deploy the built site (out/) by hand, without GitHub Actions. Normally a push to main does this
# (.github/workflows/deploy-server.yml).
# usage (Git Bash):  npm run build && SSH_KEY=/path/to/key bash scripts/deploy.sh
# Uses your own key for the ubuntu user and runs the same release script as GitHub Actions, as the deploy user.
# To undo the last deploy:  ssh -i "$SSH_KEY" ubuntu@40.233.76.178 "sudo -u deploy site-release --rollback"
set -euo pipefail

HOST="${DEPLOY_HOST:-ubuntu@40.233.76.178}"
KEY="${SSH_KEY:?set SSH_KEY to the private key file for the server}"

[ -f out/index.html ] || { echo "out/ is missing: run npm run build first" >&2; exit 1; }
id="manual-$(git rev-parse --short HEAD 2>/dev/null || date +%H%M%S)"
tar -czf - -C out . | ssh -i "$KEY" -o BatchMode=yes "$HOST" "sudo -u deploy site-release $id"
