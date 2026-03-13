/* eslint-disable @typescript-eslint/naming-convention */
// We need to use the exact tool names (like `ast-grep`), so standard naming rules don't work here.

/* eslint-disable @typescript-eslint/promise-function-async */
// Dynamic imports return a `Promise` anyway, so adding `async` is just redundant.

import { getKeys } from '@/utils'
import type { Loader } from '@/types'

export const formatter = {
    'cargo-fmt': () => import('@/formatters/cargo-fmt'),
    prettier: () => import('@/formatters/prettier'),
    shfmt: () => import('@/formatters/shfmt'),
    tombi: () => import('@/formatters/tombi'),
} as const satisfies Record<string, Loader>
export const linter = {
    actionlint: () => import('@/linters/actionlint'),
    alex: () => import('@/linters/alex'),
    'ast-grep': () => import('@/linters/ast-grep'),
    'cargo-clippy': () => import('@/linters/cargo-clippy'),
    'cargo-deny': () => import('@/linters/cargo-deny'),
    'cargo-msrv': () => import('@/linters/cargo-msrv'),
    'check-dist': () => import('@/linters/check-dist'),
    eslint: () => import('@/linters/eslint'),
    'markdownlint-cli2': () => import('@/linters/markdownlint-cli2'),
    'node-audit': () => import('@/linters/node-audit'),
    shellcheck: () => import('@/linters/shellcheck'),
    tombi: () => import('@/linters/tombi'),
    trivy: () => import('@/linters/trivy'),
    tsc: () => import('@/linters/tsc'),
    typos: () => import('@/linters/typos'),
    vale: () => import('@/linters/vale'),
    yamllint: () => import('@/linters/yamllint'),
} as const satisfies Record<string, Loader>

export type FormatterKey = keyof typeof formatter
export type LinterKey = keyof typeof linter

export const formatterKeys = getKeys(formatter)
export const linterKeys = getKeys(linter)
