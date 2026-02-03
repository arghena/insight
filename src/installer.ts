import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type FormatterKey, type LinterKey } from '@/map'

export type ToolName = FormatterKey | LinterKey | 'commitlint' | 'commitlint-config-conventional'

type PM = 'npm' | 'rustup' | 'cargo-binstall' | 'uv' | 'docker'
type Setups = Record<PM, string[]>
type Tools = Record<ToolName, { pm: PM; args: string[] }>

const installedTools = new Set<PM | ToolName>()

// NOTE: The `#!/bin/sh` in the install scripts for
// `cargo-binstall` and `uv` doesn't actually work.
export async function installer(toolName: ToolName, version: string): Promise<void> {
    const setups: Setups = {
        npm: [],
        rustup: [
            `rustup toolchain install ${version === 'latest' ? 'stable' : version} --profile minimal --no-self-update`,
            `rustup override set ${version === 'latest' ? 'stable' : version}`,
        ],
        'cargo-binstall': [
            // TODO: `dash` v0.5.13 has implemented `set -o pipefail`.
            // https://wiki.linuxfromscratch.org/blfs/ticket/22177
            'curl -fsSL https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash',
        ],
        uv: [
            'curl -fsSL https://github.com/astral-sh/uv/releases/latest/download/uv-installer.sh | sh',
        ],
        docker: [],
    }
    const tools: Tools = {
        'commitlint-config-conventional': {
            pm: 'npm',
            args: ['install', '--no-save', `@commitlint/config-conventional@${version}`],
        },
        commitlint: {
            pm: 'npm',
            args: ['install', '--global', `@commitlint/cli@${version}`],
        },
        'cargo-deny': {
            pm: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'cargo-deny' : `cargo-deny@${version}`],
        },
        'node-audit': {
            pm: 'npm',
            args: ['install', '--global', '@antfu/ni'],
        },
        'check-dist': {
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
            pm: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'typos-cli' : `typos-cli@${version}`],
        },
        yamllint: {
            pm: 'uv',
            args: ['tool', 'install', `yamllint@${version}`],
        },
        actionlint: {
            pm: 'docker',
            args: ['pull', `rhysd/actionlint:${version}`],
        },
        'ast-grep': {
            pm: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'ast-grep' : `ast-grep@${version}`],
        },
        'cargo-clippy': {
            pm: 'rustup',
            args: ['component', 'add', 'clippy'],
        },
        'cargo-fmt': {
            pm: 'rustup',
            args: ['component', 'add', 'rustfmt'],
        },
        'cargo-msrv': {
            pm: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'cargo-msrv' : `cargo-msrv@${version}`],
        },
        'cargo-tarpaulin': {
            pm: 'cargo-binstall',
            args: [
                '--no-confirm',
                version === 'latest' ? 'cargo-tarpaulin' : `cargo-tarpaulin@${version}`,
            ],
        },
        alex: {
            pm: 'npm',
            args: ['install', '--global', `alex@${version}`],
        },
        'markdownlint-cli2': {
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
            pm: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'taplo-cli' : `taplo-cli@${version}`],
        },
        tombi: {
            pm: 'uv',
            args: ['tool', 'install', `tombi@${version}`],
        },
    }
    const { pm, args } = tools[toolName]

    if (setups[pm].length !== 0 && !installedTools.has(pm)) {
        info(`[INSTALLER] Setting up the ${pm} environment`)

        for (const cmd of setups[pm]) await exec('sh', ['-c', cmd])

        installedTools.add(pm)
    }

    if (!installedTools.has(toolName)) {
        info(`[INSTALLER] Installing ${toolName} using ${pm}`)

        await exec(pm, args)

        installedTools.add(toolName)
    }
}
