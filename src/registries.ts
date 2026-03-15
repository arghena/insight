/* eslint-disable @typescript-eslint/naming-convention */
// We need to use the exact tool names (like `ast-grep`), so standard naming rules don't work here.

/* eslint-disable @typescript-eslint/promise-function-async */
// Dynamic imports return a `Promise` anyway, so adding `async` is just redundant.

import { getKeys } from '@/utils'
import {
    buildNpmArgs,
    buildDockerArgs,
    buildBinstallArgs,
    buildRustupArgs,
    buildUvArgs,
    getBinstallPackageName,
} from '@/builders'
import type { Loader, ToolName, ToolStep, ToolStepBuilder } from '@/types'

export const formatterRegistry = {
    'cargo-fmt': () => import('@/formatters/cargo-fmt'),
    prettier: () => import('@/formatters/prettier'),
    shfmt: () => import('@/formatters/shfmt'),
    tombi: () => import('@/formatters/tombi'),
} as const satisfies Record<string, Loader>
export const linterRegistry = {
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

export const toolStepBuilderRegistry: Record<ToolName, ToolStepBuilder> = {
    npm: () => [],
    rustup: ({ toolName, version }) => [
        {
            script: `${toolName} toolchain install ${version} --profile minimal --no-self-update`,
        },
        { script: `${toolName} override set ${version}` },
    ],
    'cargo-binstall': ({ toolName }) => [
        {
            script: `https://raw.githubusercontent.com/cargo-bins/${toolName}/main/install-from-binstall-release.sh`,
        },
    ],
    uv: ({ toolName }) => [
        {
            script: `https://github.com/astral-sh/${toolName}/releases/latest/download/${toolName}-installer.sh`,
        },
    ],
    docker: () => [],
    nci: () => [{ script: `npm ${buildNpmArgs('@antfu/ni').join(' ')}` }],

    actionlint: ({ toolName, version }) => [
        {
            packageManager: 'docker',
            args: buildDockerArgs(`rhysd/${toolName}:${version}`),
        },
    ],
    alex: ({ toolName, version }) => [
        {
            packageManager: 'npm',
            args: buildNpmArgs(`${toolName}@${version}`),
        },
    ],
    'ast-grep': ({ toolName, version }) => [
        {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
    ],
    'cargo-clippy': () => [
        {
            packageManager: 'rustup',
            args: buildRustupArgs('clippy'),
        },
    ],
    'cargo-deny': ({ toolName, version }) => [
        {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
    ],
    'cargo-fmt': () => [
        {
            packageManager: 'rustup',
            args: buildRustupArgs('rustfmt'),
        },
    ],
    'cargo-msrv': ({ toolName, version }) => [
        {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
    ],
    'check-dist': () => [
        {
            packageManager: 'nci',
            args: [],
        },
    ],
    eslint: ({ toolName, version, options }) => [
        {
            packageManager: 'npm',
            // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
            args: buildNpmArgs(
                `${toolName}@${version}`,
                ...(options?.hasTsEslintConfig === true ? ['jiti'] : []),
            ),
        },
        {
            packageManager: 'nci',
            args: [],
        },
    ],
    'markdownlint-cli2': ({ toolName, version }) => [
        {
            packageManager: 'npm',
            args: buildNpmArgs(`${toolName}@${version}`),
        },
    ],
    'node-audit': () => [
        {
            packageManager: 'nci',
            args: [],
        },
    ],
    prettier: ({ toolName, version }) => [
        {
            packageManager: 'npm',
            args: buildNpmArgs(`${toolName}@${version}`),
        },
    ],
    shellcheck: ({ toolName, version }) => [
        {
            packageManager: 'docker',
            args: buildDockerArgs(`koalaman/${toolName}:${version}`),
        },
    ],
    shfmt: ({ toolName, version }) => [
        {
            packageManager: 'docker',
            args: buildDockerArgs(`mvdan/${toolName}:${version}`),
        },
    ],
    tombi: ({ toolName, version }) => [
        {
            packageManager: 'uv',
            args: buildUvArgs(`${toolName}@${version}`),
        },
    ],
    trivy: ({ toolName, version, options }) => [
        {
            packageManager: 'docker',
            args: buildDockerArgs(`ghcr.io/aquasecurity/${toolName}:${version}`),
        },
        // https://trivy.dev/docs/latest/guide/coverage/language/nodejs/#pnpm
        ...(options?.hasPackageJson === true
            ? [
                  {
                      packageManager: 'nci',
                      args: [],
                  } satisfies ToolStep,
              ]
            : []),
    ],
    tsc: ({ version }) => [
        {
            packageManager: 'npm',
            args: buildNpmArgs(`typescript@${version}`),
        },
        {
            packageManager: 'nci',
            args: [],
        },
    ],
    typos: ({ toolName, version }) => [
        {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
    ],
    vale: ({ toolName, version }) => [
        {
            packageManager: 'docker',
            args: buildDockerArgs(`jdkato/${toolName}:${version}`),
        },
    ],
    yamllint: ({ toolName, version }) => [
        {
            packageManager: 'uv',
            args: buildUvArgs(`${toolName}@${version}`),
        },
    ],
}

export type FormatterKey = keyof typeof formatterRegistry
export type LinterKey = keyof typeof linterRegistry

export const formatterKeys = getKeys(formatterRegistry)
export const linterKeys = getKeys(linterRegistry)
