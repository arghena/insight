export const scheduler = {
    cargo_deny: () => import('./schedulers/cargo-deny'),
}
export const formatter = {
    prettier: () => import('./formatters/prettier'),
    cargo_fmt: () => import('./formatters/cargo-fmt'),
    shfmt: () => import('./formatters/shfmt'),
    taplo: () => import('./formatters/taplo'),
}
export const linter = {
    typos: () => import('./linters/typos'),
    yamllint: () => import('./linters/yamllint'),
    eslint: () => import('./linters/eslint'),
    actionlint: () => import('./linters/actionlint'),
    ast_grep: () => import('./linters/ast-grep'),
    cargo_clippy: () => import('./linters/cargo-clippy'),
    cargo_msrv: () => import('./linters/cargo-msrv'),
    cargo_tarpaulin: () => import('./linters/cargo-tarpaulin'),
    alex: () => import('./linters/alex'),
    markdownlint_cli2: () => import('./linters/markdownlint-cli2'),
    vale: () => import('./linters/vale'),
    shellcheck: () => import('./linters/shellcheck'),
    taplo: () => import('./linters/taplo'),
}

export type SchedulerKey = keyof typeof scheduler
export type FormatterKey = keyof typeof formatter
export type LinterKey = keyof typeof linter
