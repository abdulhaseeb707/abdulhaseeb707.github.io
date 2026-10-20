# The site on the Oracle Cloud server

The site lives at **https://abdulhaseebkhan.online**. It is the static build (`npm run build` writes it to `out/`), served
by [Caddy](https://caddyserver.com) on an Oracle Cloud machine. Caddy gets and renews the HTTPS certificate by itself.

## The machine

- **haseeb-server**, Oracle Cloud, Canada Southeast (Toronto), Always Free `VM.Standard.E2.1.Micro` (1 GB memory),
  Ubuntu 24.04, public IP **40.233.76.178**, user `ubuntu`.
- Oracle's security list for the network `haseeb` already lets all traffic in; the machine's own firewall (iptables)
  decides. Ports 22 (SSH), 80 and 443 (web) and the VPN's IPsec ports are open. The rules are saved in both
  `/etc/iptables/rules.v4` and `/etc/iptables.rules` (the VPN setup loads the second), so they survive a reboot.
- The site's files: `/var/www/abdulhaseebkhan.online`. Caddy's config: `/etc/caddy/Caddyfile`, a copy of
  [`deploy/Caddyfile`](deploy/Caddyfile).

## The domain

`abdulhaseebkhan.online` is registered with Hostinger. In Hostinger's DNS zone for it:

| Type | Name | Points to |
|---|---|---|
| A | `@` | `40.233.76.178` |
| CNAME | `www` | `abdulhaseebkhan.online` |

No other `A` or `AAAA` record for `@` or `www` (Hostinger's parking records would send visitors elsewhere).
`www.abdulhaseebkhan.online` forwards to `https://abdulhaseebkhan.online`.

## Updating the site

From the repo, in Git Bash:

```bash
npm run build && npm run qa
SSH_KEY="/path/to/ssh-key.key" bash scripts/deploy.sh
```

`scripts/deploy.sh` uploads `out/` and switches to it in one step; the previous version stays on the server as
`/var/www/abdulhaseebkhan.online.old` until the next upload. To go back to it:

```bash
ssh -i "$SSH_KEY" ubuntu@40.233.76.178 'sudo mv /var/www/abdulhaseebkhan.online /var/www/abdulhaseebkhan.online.bad && sudo mv /var/www/abdulhaseebkhan.online.old /var/www/abdulhaseebkhan.online'
```

If `deploy/Caddyfile` changes, copy it to the server and reload Caddy:

```bash
scp -i "$SSH_KEY" deploy/Caddyfile ubuntu@40.233.76.178:/tmp/Caddyfile
ssh -i "$SSH_KEY" ubuntu@40.233.76.178 'sudo cp /tmp/Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy'
```

## Notes

- The site is fully static, so the server needs no Node.js or Docker; this suits a 1 GB machine. The `Dockerfile`
  (`NEXT_OUTPUT=standalone`, a Node server) is still in the repo in case the site ever needs server-side code.
- Keep the SSH key out of synced folders (OneDrive and the like).
