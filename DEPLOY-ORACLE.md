# Moving the site to an Oracle Cloud server

The site runs on GitHub Pages today as static files. The same code also builds as a small Node server
(`NEXT_OUTPUT=standalone`), packaged by the `Dockerfile`. These are the steps for when the server is ready.

## 1. The machine

1. In Oracle Cloud, create a compute instance (the Always Free Ampere A1 or AMD shape is enough) with Ubuntu 24.04.
2. In the instance's subnet **security list**, allow inbound TCP **80** and **443** from `0.0.0.0/0`.
3. Ubuntu images on Oracle also block ports in iptables. Open them on the machine:

   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo netfilter-persistent save
   ```

## 2. Docker and the site

```bash
curl -fsSL https://get.docker.com | sudo sh
git clone https://github.com/abdulhaseeb707/abdulhaseeb707.github.io.git portfolio
cd portfolio
sudo docker build -t portfolio .
sudo docker run -d --name portfolio --restart unless-stopped -p 127.0.0.1:3000:3000 portfolio
```

The site is now on `http://127.0.0.1:3000` on the machine. The CV is at `/Abdul-Haseeb-Khan-CV.pdf`.

## 3. HTTPS with a domain (Caddy)

Point the domain's `A` record at the instance's public IP, then:

```bash
sudo apt install -y caddy
echo 'yourdomain.com {
  reverse_proxy 127.0.0.1:3000
}' | sudo tee /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy gets and renews the certificate by itself.

## 4. Updating

```bash
cd portfolio && git pull
sudo docker build -t portfolio . && sudo docker rm -f portfolio
sudo docker run -d --name portfolio --restart unless-stopped -p 127.0.0.1:3000:3000 portfolio
```

## Notes

- The CV PDF is rendered at build time from `content/profile.yaml`, in both modes. To render it on every request
  instead, change `dynamic = 'force-static'` to `'force-dynamic'` in `app/Abdul-Haseeb-Khan-CV.pdf/route.ts`
  (server mode only; GitHub Pages needs it static).
- When the site moves to its own domain, update `site.url` in `lib/profile.ts`.
