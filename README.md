datarchi.netlify.app

## Demo User
``E-Mail:`` demo@datarchi.com
``Password:`` 123456

## Deploying to Netlify

Recommended simple static deploy (site files are in repository root):

- In Netlify web UI set:
	- Build command: leave empty
	- Publish directory: `.`

- Or connect your Git repo and add `netlify.toml` (included) which publishes the repository root.

If you want Netlify to run a build step (Vite):

```bash
# Install dependencies and build locally
npm ci
npm run build

# Then deploy the `dist` folder or set Netlify:
# Build command: npm run build
# Publish directory: dist
```

If you see a 403 on push to GitHub, push to your fork and open a PR against the main repo instead.

If deployment fails on Netlify, provide the Netlify deploy log (from Site deploys → Deploy details) and I'll inspect it.
