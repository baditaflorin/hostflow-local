.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout release

help:
	@printf '%s\n' \
		'install-hooks      wire .githooks' \
		'dev                run the frontend dev server' \
		'build              build the Pages-ready static app into dist/' \
		'test               run unit tests' \
		'test-integration   run integration tests (none in Mode A v1)' \
		'smoke              build, serve, and run Playwright smoke tests' \
		'lint               run eslint, prettier check, and typecheck' \
		'fmt                autoformat source files' \
		'pages-preview      serve dist/ exactly as Pages would' \
		'release            tag the current commit as v$$(node -p "require(\"./package.json\").version")'

install-hooks:
	git config core.hooksPath .githooks

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-integration:
	@printf '%s\n' 'No integration suite is required for Mode A v1.'

smoke:
	npm run smoke

lint:
	npm run lint
	npm run format:check
	npm run typecheck

fmt:
	npm run format

pages-preview:
	npm run pages:preview

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

hooks-post-merge:
	.githooks/post-merge

hooks-post-checkout:
	.githooks/post-checkout

release:
	git tag v$$(node -p "require('./package.json').version")

clean:
	rm -rf dist coverage playwright-report test-results
