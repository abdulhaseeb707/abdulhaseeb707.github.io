#!/usr/bin/env bash
# Sets up an Ubuntu 24.04 server (Oracle Cloud) to serve abdulhaseebkhan.online. Safe to run again at any time.
#
# From the repo, in Git Bash (SSH_KEY is your own key for the ubuntu user):
#   scp -r -i "$SSH_KEY" deploy ubuntu@40.233.76.178:/tmp/site-deploy
#   ssh -i "$SSH_KEY" ubuntu@40.233.76.178 "sudo bash /tmp/site-deploy/setup-server.sh '<deploy public key>'"
#
# It installs Caddy (HTTPS is automatic), opens ports 80 and 443 in the firewall (other rules, such as the VPN's, are
# kept), creates the `deploy` user that GitHub Actions logs in as, lays out the site folder as releases plus a
# `current` link, and installs the Caddyfile and the release script (deploy/site-release.sh). The optional argument
# is the public half of the GitHub Actions deploy key; that key may only run `site-release`.
set -euo pipefail

DOMAIN=abdulhaseebkhan.online
SITE=/var/www/$DOMAIN
HERE="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_PUBKEY="${1:-}"

[ "$(id -u)" = 0 ] || { echo "run this with sudo" >&2; exit 1; }
for f in Caddyfile site-release.sh; do [ -f "$HERE/$f" ] || { echo "missing $HERE/$f" >&2; exit 1; }; done

echo "1. Caddy"
if ! command -v caddy >/dev/null; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq caddy >/dev/null
fi
caddy version

echo "2. firewall: ports 80 and 443"
reject='^-A INPUT -j REJECT --reject-with icmp-host-prohibited$'
for port in 80 443; do
  if ! iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport "$port" -j ACCEPT 2>/dev/null; then
    pos="$(iptables -L INPUT --line-numbers -n | awk '$2 == "REJECT" { print $1; exit }')"
    if [ -n "$pos" ]; then
      iptables -I INPUT "$pos" -p tcp -m state --state NEW -m tcp --dport "$port" -j ACCEPT
    else
      iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport "$port" -j ACCEPT
    fi
  fi
  # the saved rules: netfilter-persistent loads rules.v4; the VPN setup loads /etc/iptables.rules
  for f in /etc/iptables/rules.v4 /etc/iptables.rules; do
    [ -f "$f" ] || continue
    if ! grep -q -- "--dport $port -j ACCEPT" "$f"; then
      [ -f "$f.bak-before-site" ] || cp "$f" "$f.bak-before-site"
      sed -i "/$reject/i -A INPUT -p tcp -m state --state NEW -m tcp --dport $port -j ACCEPT" "$f"
    fi
  done
done

echo "3. the deploy user"
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
if [ -n "$DEPLOY_PUBKEY" ]; then
  line="restrict,command=\"/usr/local/bin/site-release\" $DEPLOY_PUBKEY"
  grep -qxF "$line" /home/deploy/.ssh/authorized_keys || echo "$line" >> /home/deploy/.ssh/authorized_keys
fi
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

echo "4. the site folder: $SITE/releases and $SITE/current"
install -d -m 755 -o deploy -g deploy "$SITE" "$SITE/releases"
if [ -f "$SITE/index.html" ] && [ ! -L "$SITE/current" ]; then
  # an older layout with the files straight in $SITE: keep them as the first release
  first="$SITE/releases/00000000-000000-initial"
  install -d -o deploy -g deploy "$first"
  find "$SITE" -mindepth 1 -maxdepth 1 ! -name releases -exec mv {} "$first/" \;
  chown -R deploy:deploy "$first"
  ln -sfn "$first" "$SITE/current"
  chown -h deploy:deploy "$SITE/current"
fi
rm -rf "$SITE.old" "$SITE.new" "$SITE.bad"

echo "5. release script and Caddy config"
install -m 755 "$HERE/site-release.sh" /usr/local/bin/site-release
install -m 644 "$HERE/Caddyfile" /etc/caddy/Caddyfile
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1
systemctl enable --now caddy >/dev/null 2>&1
systemctl reload caddy

if [ -L "$SITE/current" ]; then
  echo "ready: https://$DOMAIN serves $(readlink "$SITE/current")"
else
  echo "ready: Caddy is set up; the first deploy (site-release) will create $SITE/current"
fi
