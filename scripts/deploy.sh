#!/usr/bin/env bash
# Upload the built site (out/) to the Oracle Cloud server and switch to it in one step.
# usage (Git Bash):  npm run build && SSH_KEY=/path/to/key bash scripts/deploy.sh
# The previous version stays on the server as /var/www/abdulhaseebkhan.online.old until the next upload.
set -euo pipefail

HOST="${DEPLOY_HOST:-ubuntu@40.233.76.178}"
KEY="${SSH_KEY:?set SSH_KEY to the server's private key file}"
WEB=/var/www/abdulhaseebkhan.online

[ -f out/index.html ] || { echo "out/ is missing: run npm run build first" >&2; exit 1; }
tarball="$(mktemp -t site.XXXXXX).tgz"
tar -czf "$tarball" -C out .
scp -q -i "$KEY" -o BatchMode=yes "$tarball" "$HOST:/tmp/site.tgz"
rm -f "$tarball"

ssh -i "$KEY" -o BatchMode=yes "$HOST" "bash -s" <<EOF
set -euo pipefail
sudo rm -rf $WEB.new && sudo mkdir -p $WEB.new
sudo tar -xzf /tmp/site.tgz -C $WEB.new && rm -f /tmp/site.tgz
sudo rm -rf $WEB.old
if [ -d $WEB ]; then sudo mv $WEB $WEB.old; fi
sudo mv $WEB.new $WEB
sudo chown -R root:root $WEB && sudo chmod -R a+rX $WEB
echo "deployed \$(sudo find $WEB -type f | wc -l) files"
EOF
