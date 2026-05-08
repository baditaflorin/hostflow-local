#!/usr/bin/env bash
set -euo pipefail

npm run build

worktree="${TMPDIR:-/tmp}/hostflow-local-gh-pages"
rm -rf "$worktree"
git worktree add -B gh-pages "$worktree" origin/gh-pages
find "$worktree" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. "$worktree"/
touch "$worktree"/.nojekyll
git -C "$worktree" add -A

if git -C "$worktree" diff --cached --quiet; then
  printf '%s\n' 'No Pages changes to publish.'
else
  git -C "$worktree" commit -m "ops: publish pages"
  git -C "$worktree" push origin gh-pages
fi

git worktree remove "$worktree"
