# The site on the Oracle Cloud server

The site lives at **https://abdulhaseebkhan.online**. It is the static build (`npm run build` writes it to `out/`), served
by [Caddy](https://caddyserver.com) on an Oracle Cloud machine. Caddy gets and renews the HTTPS certificate by itself.

**Every push to `main` deploys it.** GitHub Actions ([`.github/workflows/deploy-server.yml`](.github/workflows/deploy-server.yml))
builds the site and the CV, runs the rule checks, uploads the build to the server as a new release, switches to it
and checks the live pages. A failed build or check never reaches the server.

## The machine

- **haseeb-server**, Oracle Cloud, Canada Southeast (Toronto), Always Free `VM.Standard.E2.1.Micro` (1 GB memory),
  Ubuntu 24.04, public IP **40.233.76.178**.
- Users: `ubuntu` (the owner's login, key in `C:\Users\Abdul Haseeb\.ssh\ssh-key-2026-06-12.key`) and `deploy`
  (GitHub Actions; its key may only run `site-release`).
- Oracle's security list for the network `haseeb` already lets all traffic in; the machine's own firewall (iptables)
  decides. Ports 22 (SSH), 80 and 443 (web) and the VPN's IPsec ports are open, saved in both
  `/etc/iptables/rules.v4` and `/etc/iptables.rules` (the VPN setup loads the second), so they survive a reboot.
- The site: `/var/www/abdulhaseebkhan.online/releases/<date>-<commit>/`, with `current` pointing at the live one
  (the last 5 are kept). Caddy's config is `/etc/caddy/Caddyfile`, a copy of [`deploy/Caddyfile`](deploy/Caddyfile).

## The domain

`abdulhaseebkhan.online` is registered with Hostinger. In Hostinger's DNS zone for it:

| Type | Name | Points to |
|---|---|---|
| A | `@` | `40.233.76.178` |
| CNAME | `www` | `abdulhaseebkhan.online` |

No other `A` or `AAAA` record for `@` or `www` (Hostinger's parking records would send visitors elsewhere).
`www.abdulhaseebkhan.online` forwards to `https://abdulhaseebkhan.online`.

## Everyday use

| I want to… | Do this |
|---|---|
| Publish a change | commit and push to `main`; watch it under the repo's **Actions** tab |
| Publish without GitHub | `npm run build`, then in Git Bash `SSH_KEY="C:/Users/Abdul Haseeb/.ssh/ssh-key-2026-06-12.key" bash scripts/deploy.sh` |
| Undo the last deploy | `ssh -i <key> ubuntu@40.233.76.178 "sudo -u deploy site-release --rollback"` |
| See the releases | `ssh -i <key> ubuntu@40.233.76.178 "sudo -u deploy site-release --list"` |
| Re-run a deploy | Actions tab → *Build the site and the CV, then deploy* → **Run workflow** |
| Change the Caddy config | edit `deploy/Caddyfile`, then run the setup script again (below) |

## Setting up a server from scratch

[`deploy/setup-server.sh`](deploy/setup-server.sh) does it all and is safe to run again: it installs Caddy, opens ports
80 and 443, creates the `deploy` user, lays out the site folder, and installs the Caddyfile and
[`deploy/site-release.sh`](deploy/site-release.sh) (as `/usr/local/bin/site-release`).

1. Make a deploy key for GitHub Actions (no passphrase):
   `ssh-keygen -t ed25519 -N "" -C github-actions-deploy -f deploy-key`
2. Copy the `deploy` folder to the server and run the setup with the key's public half:

   ```bash
   scp -r -i "$SSH_KEY" deploy ubuntu@<server>:/tmp/site-deploy
   ssh -i "$SSH_KEY" ubuntu@<server> "sudo bash /tmp/site-deploy/setup-server.sh '$(cat deploy-key.pub)'"
   ```
3. Give GitHub the private half and the server's identity, then delete the local key files:

   ```bash
   gh secret set DEPLOY_SSH_KEY < deploy-key
   ssh-keyscan -t ed25519 <server> | gh secret set DEPLOY_KNOWN_HOSTS
   rm deploy-key deploy-key.pub
   ```
4. If the server's address changes, update `SERVER` in `.github/workflows/deploy-server.yml`, `HOST` in
   `scripts/deploy.sh` and the domain's `A` record.

To replace the deploy key (for example if it may have leaked), repeat steps 1 to 3 and remove the old line from
`/home/deploy/.ssh/authorized_keys` on the server. To change only the Caddy config, step 2 without the key is enough.

## The old address

`abdulhaseeb707.github.io` (GitHub Pages for this repo) only forwards visitors to the same page on
https://abdulhaseebkhan.online. [`.github/workflows/pages-redirect.yml`](.github/workflows/pages-redirect.yml)
publishes [`deploy/github-pages/`](deploy/github-pages/) on every push to `main`; nothing else of the site goes to
GitHub Pages.

## Notes

- The site is fully static, so the server needs no Node.js or Docker; this suits a 1 GB machine. The `Dockerfile`
  (`NEXT_OUTPUT=standalone`, a Node server) is still in the repo in case the site ever needs server-side code.
- Keep SSH keys out of synced folders (OneDrive and the like).
