# Deploy

Live site: https://baditaflorin.github.io/hostflow-local/

Repository: https://github.com/baditaflorin/hostflow-local

## Strategy

GitHub Pages serves the `gh-pages` branch root. The main branch builds static files into `dist/`; the publish branch contains only the generated artifact.

## Manual publish

```bash
npm install
make publish-pages
```

## Rollback

Revert the latest publish commit on `gh-pages`, or republish a previous main commit by checking it out, running `npm run build`, and publishing the resulting `dist/`.

## Custom domain

No custom domain is configured. If one is added, place `CNAME` in the generated artifact and configure DNS with GitHub Pages:

https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
