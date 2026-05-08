# Deploy

Live site: https://baditaflorin.github.io/hostflow-local/

Repository: https://github.com/baditaflorin/hostflow-local

## Strategy

GitHub Pages serves the `gh-pages` branch root. The main branch builds static files into `dist/`; the publish branch contains only the generated artifact.

## Manual publish

```bash
npm install
npm run build
git worktree add -B gh-pages /tmp/hostflow-local-gh-pages origin/gh-pages
find /tmp/hostflow-local-gh-pages -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. /tmp/hostflow-local-gh-pages/
touch /tmp/hostflow-local-gh-pages/.nojekyll
git -C /tmp/hostflow-local-gh-pages add -A
git -C /tmp/hostflow-local-gh-pages commit -m "ops: publish pages"
git -C /tmp/hostflow-local-gh-pages push origin gh-pages
```

## Rollback

Revert the latest publish commit on `gh-pages`, or republish a previous main commit by checking it out, running `npm run build`, and publishing the resulting `dist/`.

## Custom domain

No custom domain is configured. If one is added, place `CNAME` in the generated artifact and configure DNS with GitHub Pages:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
