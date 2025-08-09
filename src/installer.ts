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
        setup: string[]
        cmd: string[]
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
            setup: setups.npm,
            cmd: [
                'install',
                '--no-save',
                `@commitlint/config-conventional@${version}`,
            ],
        },
        commitlint: {
            pm: 'npm',
            setup: setups.npm,
            cmd: ['install', '--global', `@commitlint/cli@${version}`],
        },
        check_dist: {
            pm: 'npm',
            setup: setups.npm,
            cmd: ['install', '--global', '@antfu/ni'],
        },
        cargo_deny: {
            pm: 'cargo',
            setup: setups.cargo,
            cmd: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'cargo-deny' : `cargo-deny@${version}`,
            ],
        },
        prettier: {
            pm: 'npm',
            setup: setups.npm,
            cmd: ['install', '--global', `prettier@${version}`],
        },
        eslint: {
            pm: 'npm',
            setup: setups.npm,
            cmd: [
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
            setup: setups.cargo,
            cmd: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'typos-cli' : `typos-cli@${version}`,
            ],
        },
        yamllint: {
            pm: 'uv',
            setup: setups.uv,
            cmd: ['tool', 'install', `yamllint@${version}`],
        },
        actionlint: {
            pm: 'docker',
            setup: setups.docker,
            cmd: ['pull', `rhysd/actionlint:${version}`],
        },
        ast_grep: {
            pm: 'cargo',
            setup: setups.cargo,
            cmd: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'ast-grep' : `ast-grep@${version}`,
            ],
        },
        cargo_clippy: {
            pm: 'rustup',
            setup: setups.rustup,
            cmd: ['component', 'add', 'clippy'],
        },
        cargo_fmt: {
            pm: 'rustup',
            setup: setups.rustup,
            cmd: ['component', 'add', 'rustfmt'],
        },
        cargo_msrv: {
            pm: 'cargo',
            setup: setups.cargo,
            cmd: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'cargo-msrv' : `cargo-msrv@${version}`,
            ],
        },
        cargo_tarpaulin: {
            pm: 'cargo',
            setup: setups.cargo,
            cmd: [
                'binstall',
                '--no-confirm',
                version === 'latest'
                    ? 'cargo-tarpaulin'
                    : `cargo-tarpaulin@${version}`,
            ],
        },
        alex: {
            pm: 'npm',
            setup: setups.npm,
            cmd: ['install', '--global', `alex@${version}`],
        },
        markdownlint_cli2: {
            pm: 'npm',
            setup: setups.npm,
            cmd: ['install', '--global', `markdownlint-cli2@${version}`],
        },
        vale: {
            pm: 'docker',
            setup: setups.docker,
            cmd: ['pull', `jdkato/vale:${version}`],
        },
        shfmt: {
            pm: 'docker',
            setup: setups.docker,
            cmd: ['pull', `mvdan/shfmt:${version}`],
        },
        shellcheck: {
            pm: 'docker',
            setup: setups.docker,
            cmd: ['pull', `koalaman/shellcheck:${version}`],
        },
        taplo: {
            pm: 'cargo',
            setup: setups.cargo,
            cmd: [
                'binstall',
                '--no-confirm',
                version === 'latest' ? 'taplo-cli' : `taplo-cli@${version}`,
            ],
        },
    }

    if (tools[name].setup.length !== 0) {
        info(`[installer] Setting up the ${tools[name].pm} environment`)

        for (const cmd of tools[name].setup) await exec('sh', ['-c', cmd])
    }

    info(`[installer] Installing ${name} using ${tools[name].pm}`)

    await exec(tools[name].pm, tools[name].cmd)
}
