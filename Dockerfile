# Dockerfile
FROM node:24-bookworm-slim

# Install tini for signal handling and wget for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends tini wget ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install the correct package globally (provides the `opencode` CLI)
RUN npm i -g opencode-ai@latest

# Sanity check so the build fails early if the CLI isn't present
RUN which opencode && opencode --version

# Ensure the config/data directories exist (bind mounts will overlay)
RUN mkdir -p /root/.config/opencode /root/.local/share/opencode

ENV NODE_ENV=production
EXPOSE 56050

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["opencode", "serve", "--hostname", "0.0.0.0", "--port", "56050"]