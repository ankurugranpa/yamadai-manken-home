.PHONY: help deps dev test lint typecheck format deploy db/start

help: ## Show this help
	@grep -E '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

deps: ## Install dependencies
	npm install

dev: deps ## Start development server
	NODE_EXTRA_CA_CERTS=./certs/supabase-prod-ca-2021.crt TZ=UTC npm run dev

lint: db/start ## Run ESLint
	npm run lint

typecheck: ## Run TypeScript type check
	npm run typecheck

vitest: db/start ## Run API tests with watch mode
	npx vitest

vitest/run: db/start ## Run API tests
	npx vitest run

test: deps lint typecheck vitest/run ## Run lint and typecheck and vitest

format: ## Format code with Prettier
	npm run format

deploy: ## Deploy to Cloudflare Workers
	npm run deploy

db/start: ## Start PostgreSQL container for testing
	@$(MAKE) -C ../db start