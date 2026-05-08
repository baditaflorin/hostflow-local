# Contributing

Thanks for improving HostFlow Local.

## Local setup

```bash
npm install
make install-hooks
make test
make build
```

Use Conventional Commits such as `feat: add pricing analyzer` or `docs: record storage adr`.

## Quality bar

- Keep the app static and GitHub Pages friendly.
- Do not add runtime secrets or hosted auth.
- Add focused tests with feature changes.
- Run `make lint`, `make test`, and `make smoke` before pushing.
