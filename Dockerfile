# The site as a Node server for the Oracle Cloud machine (Next.js standalone output).
# docker build -t portfolio . && docker run -d --restart unless-stopped -p 3000:3000 portfolio

FROM node:24-alpine AS deps
WORKDIR /app
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# makes the doodle tile and WebP photos, builds the server, renders the CV PDF, runs the source checks
RUN npm run build

FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S site && adduser -S site -G site
COPY --from=build --chown=site:site /app/.next/standalone ./
COPY --from=build --chown=site:site /app/.next/static ./.next/static
COPY --from=build --chown=site:site /app/public ./public
# content and fonts, in case a page or the CV is rendered on the server rather than at build time
COPY --from=build --chown=site:site /app/content ./content
COPY --from=build --chown=site:site /app/node_modules/@fontsource ./node_modules/@fontsource
USER site
EXPOSE 3000
CMD ["node", "server.js"]
