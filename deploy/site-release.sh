#!/usr/bin/env bash
# Installed on the server as /usr/local/bin/site-release by deploy/setup-server.sh, and run as the `deploy` user.
#
#   site-release <id> < site.tar.gz    unpack the built site (out/) as a new release and switch to it in one step
#   site-release --rollback            switch back to the release before the current one
#   site-release --list                show the releases (* marks the live one)
#
# GitHub Actions logs in with a key that may run only this script (see setup-server.sh), so a leaked key can do no
# more than publish a release. The last 5 releases are kept.
set -euo pipefail

SITE=/var/www/abdulhaseebkhan.online
KEEP=5

# over SSH with a forced command, the requested command arrives in SSH_ORIGINAL_COMMAND
if [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
  set -f
  # shellcheck disable=SC2086
  set -- $SSH_ORIGINAL_COMMAND
  set +f
  if [ "${1:-}" != site-release ]; then echo "this key may only run site-release" >&2; exit 2; fi
  shift
fi

cd "$SITE"
current="$(basename "$(readlink current 2>/dev/null || echo none)")"
switch() { ln -sfn "$SITE/releases/$1" current.tmp && mv -T current.tmp current; }

case "${1:-}" in
  --list)
    for r in $(ls -1 releases | sort); do
      if [ "$r" = "$current" ]; then echo "* $r"; else echo "  $r"; fi
    done
    ;;
  --rollback)
    prev="$(ls -1 releases | sort | awk -v c="$current" '$0 == c { print p; exit } { p = $0 }')"
    [ -n "$prev" ] || { echo "no earlier release to go back to" >&2; exit 1; }
    switch "$prev"
    echo "live: $prev (rolled back from $current)"
    ;;
  ""|-*)
    echo "usage: site-release <id> < site.tar.gz | site-release --rollback | site-release --list" >&2
    exit 2
    ;;
  *)
    id="$1"
    case "$id" in *[!A-Za-z0-9._-]*) echo "release id may only use letters, digits, . _ -" >&2; exit 2 ;; esac
    name="$(date -u +%Y%m%d-%H%M%S)-$id"
    mkdir -p "releases/$name"
    tar -xzf - -C "releases/$name"
    if [ ! -f "releases/$name/index.html" ]; then
      rm -rf "releases/$name"
      echo "the upload has no index.html; nothing changed" >&2
      exit 1
    fi
    chmod -R a+rX "releases/$name"
    switch "$name"
    # keep the newest $KEEP releases, never the live one
    ls -1 releases | sort | head -n "-$KEEP" | while read -r old; do
      [ "$old" = "$name" ] || rm -rf "releases/$old"
    done
    echo "live: $name"
    ;;
esac
