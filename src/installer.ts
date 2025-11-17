import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type FormatterKey, type LinterKey } from './map'

export type CommitLinter = 'commitlint' | 'commitlint_config_conventional'

type PM = 'npm' | 'rustup' | 'cargo' | 'uv' | 'docker'

type Setups = Record<PM, string[]>

type Tools = Record<
    CommitLinter | FormatterKey | LinterKey,
    {
        pm: PM
        args: string[]
    }
>

// NOTE:
// The `#!/bin/sh` in the install scripts for
// `cargo-binstall` and `uv` doesn't actually work.
export async function installer(
    name: CommitLinter | FormatterKey | LinterKey,
    version: string,
): Promise<void> {
    const setups: Setups = {
        npm: [],
        rustup:
            version === 'latest'
                ? ['rustup update', 'rustup default stable']
                : [
                      `rustup toolchain install ${version} --profile minimal`,
                      `rustup default ${version}`,
                  ],
        cargo: [
            'curl -fsSL https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | sh',
        ],
        uv: [
            'curl -fsSL https://github.com/astral-sh/uv/releases/latest/download/uv-installer.sh | sh',
        ],
        docker: [],
    }
    const tools: Tools = {
        commitlint_config_conventional: {
            pm: 'npm',
            args: ['install', '--no-save', `@commitlint/config-conventional@${version}`],
        },
        commitlint: {
            pm: 'npm',
            args: ['install', '--global', `@commitlint/cli@${version}`],
        },
        cargo_deny: {
            pm: 'cargo',
            args: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'cargo-deny' : `cargo-deny@${version}`,
            ],
        },
        node_audit: {
            pm: 'npm',
            args: ['install', '--global', '@antfu/ni'],
        },
        check_dist: {
            pm: 'npm',
            args: ['install', '--global', '@antfu/ni'],
        },
        prettier: {
            pm: 'npm',
            args: ['install', '--global', `prettier@${version}`],
        },
        eslint: {
            pm: 'npm',
            args: [
                'install',
                '--global',
                `eslint@${version}`,
                // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
                'jiti',
                '@antfu/ni',
            ],
        },
        typos: {
            pm: 'cargo',
            args: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'typos-cli' : `typos-cli@${version}`,
            ],
        },
        yamllint: {
            pm: 'uv',
            args: ['tool', 'install', `yamllint@${version}`],
        },
        actionlint: {
            pm: 'docker',
            args: ['pull', `rhysd/actionlint:${version}`],
        },
        ast_grep: {
            pm: 'cargo',
            args: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'ast-grep' : `ast-grep@${version}`,
            ],
        },
        cargo_clippy: {
            pm: 'rustup',
            args: ['component', 'add', 'clippy'],
        },
        cargo_fmt: {
            pm: 'rustup',
            args: ['component', 'add', 'rustfmt'],
        },
        cargo_msrv: {
            pm: 'cargo',
            args: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'cargo-msrv' : `cargo-msrv@${version}`,
            ],
        },
        cargo_tarpaulin: {
            pm: 'cargo',
            args: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'cargo-tarpaulin' : `cargo-tarpaulin@${version}`,
            ],
        },
        alex: {
            pm: 'npm',
            args: ['install', '--global', `alex@${version}`],
        },
        markdownlint_cli2: {
            pm: 'npm',
            args: ['install', '--global', `markdownlint-cli2@${version}`],
        },
        vale: {
            pm: 'docker',
            args: ['pull', `jdkato/vale:${version}`],
        },
        shfmt: {
            pm: 'docker',
            args: ['pull', `mvdan/shfmt:${version}`],
        },
        shellcheck: {
            pm: 'docker',
            args: ['pull', `koalaman/shellcheck:${version}`],
        },
        taplo: {
            pm: 'cargo',
            args: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'taplo-cli' : `taplo-cli@${version}`,
            ],
        },
        tombi: {
            pm: 'uv',
            args: ['tool', 'install', `tombi@${version}`],
        },
    }
    const { pm, args } = tools[name]

    if (setups[pm].length !== 0) {
        info(`[installer] Setting up the ${pm} environment`)

        for (const cmd of setups[pm]) await exec('sh', ['-c', cmd])
    }

    info(`[installer] Installing ${name} using ${pm}`)

    await exec(pm, args)
}
