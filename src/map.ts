export const formatter = {
    prettier: () => import('./formatters/prettier'),
    'cargo-fmt': () => import('./formatters/cargo-fmt'),
    shfmt: () => import('./formatters/shfmt'),
    taplo: () => import('./formatters/taplo'),
    tombi: () => import('./formatters/tombi'),
}
export const linter = {
    'cargo-deny': () => import('./linters/cargo-deny'),
    'node-audit': () => import('./linters/node-audit'),
    'check-dist': () => import('./linters/check-dist'),
    typos: () => import('./linters/typos'),
    yamllint: () => import('./linters/yamllint'),
    eslint: () => import('./linters/eslint'),
    actionlint: () => import('./linters/actionlint'),
    'ast-grep': () => import('./linters/ast-grep'),
    'cargo-clippy': () => import('./linters/cargo-clippy'),
    'cargo-msrv': () => import('./linters/cargo-msrv'),
    'cargo-tarpaulin': () => import('./linters/cargo-tarpaulin'),
    alex: () => import('./linters/alex'),
    'markdownlint-cli2': () => import('./linters/markdownlint-cli2'),
    vale: () => import('./linters/vale'),
    shellcheck: () => import('./linters/shellcheck'),
    taplo: () => import('./linters/taplo'),
    tombi: () => import('./linters/tombi'),
}

export type FormatterKey = keyof typeof formatter
export type LinterKey = keyof typeof linter
