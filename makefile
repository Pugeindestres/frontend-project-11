setup:
	npm ci

install:
	npm ci

dev:
	npm run dev

build:
	npm run build

start:
	npm run dev

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

test:
	npx playwright test