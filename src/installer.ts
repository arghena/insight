import { homedir } from 'node:os'
import { join } from 'node:path'
import { env } from 'node:process'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type FormatterKey, type LinterKey } from '@/map'

export type ToolName = FormatterKey | LinterKey | 'commitlint' | 'commitlint-config-conventional'

type PackageManager = 'pnpm' | 'rustup' | 'cargo-binstall' | 'uv' | 'docker'
type SetupMap = Record<PackageManager, string[]>
type ToolRegistry = Record<
    ToolName,
    {
        packageManager: PackageManager
        args: string[]
    }
>

const installedTools = new Set<PackageManager | ToolName>()

// NOTE: The `#!/bin/sh` in the install scripts for
// `cargo-binstall` and `uv` doesn't actually work.
export async function installer(toolName: ToolName, version: string): Promise<void> {
    const setupMap = {
        pnpm: ['corepack enable pnpm'],
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
    } satisfies SetupMap
    const toolRegistry = {
        'commitlint-config-conventional': {
            packageManager: 'pnpm',
            args: ['install', '--global', `@commitlint/config-conventional@${version}`],
        },
        commitlint: {
            packageManager: 'pnpm',
            args: ['install', '--global', `@commitlint/cli@${version}`],
        },
        'cargo-deny': {
            packageManager: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'cargo-deny' : `cargo-deny@${version}`],
        },
        'node-audit': {
            packageManager: 'pnpm',
            args: ['install', '--global', '@antfu/ni'],
        },
        'check-dist': {
            packageManager: 'pnpm',
            args: ['install', '--global', '@antfu/ni'],
        },
        prettier: {
            packageManager: 'pnpm',
            args: ['install', '--global', `prettier@${version}`],
        },
        eslint: {
            packageManager: 'pnpm',
            args: [
                'install',
                '--global',
                '@antfu/ni',
                `eslint@${version}`,
                // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
                'jiti',
            ],
        },
        typos: {
            packageManager: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'typos-cli' : `typos-cli@${version}`],
        },
        yamllint: {
            packageManager: 'uv',
            args: ['tool', 'install', `yamllint@${version}`],
        },
        actionlint: {
            packageManager: 'docker',
            args: ['pull', `rhysd/actionlint:${version}`],
        },
        'ast-grep': {
            packageManager: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'ast-grep' : `ast-grep@${version}`],
        },
        'cargo-clippy': {
            packageManager: 'rustup',
            args: ['component', 'add', 'clippy'],
        },
        'cargo-fmt': {
            packageManager: 'rustup',
            args: ['component', 'add', 'rustfmt'],
        },
        'cargo-msrv': {
            packageManager: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'cargo-msrv' : `cargo-msrv@${version}`],
        },
        'cargo-tarpaulin': {
            packageManager: 'cargo-binstall',
            args: [
                '--no-confirm',
                version === 'latest' ? 'cargo-tarpaulin' : `cargo-tarpaulin@${version}`,
            ],
        },
        alex: {
            packageManager: 'pnpm',
            args: ['install', '--global', `alex@${version}`],
        },
        'markdownlint-cli2': {
            packageManager: 'pnpm',
            args: ['install', '--global', `markdownlint-cli2@${version}`],
        },
        vale: {
            packageManager: 'docker',
            args: ['pull', `jdkato/vale:${version}`],
        },
        shfmt: {
            packageManager: 'docker',
            args: ['pull', `mvdan/shfmt:${version}`],
        },
        shellcheck: {
            packageManager: 'docker',
            args: ['pull', `koalaman/shellcheck:${version}`],
        },
        taplo: {
            packageManager: 'cargo-binstall',
            args: ['--no-confirm', version === 'latest' ? 'taplo-cli' : `taplo-cli@${version}`],
        },
        tombi: {
            packageManager: 'uv',
            args: ['tool', 'install', `tombi@${version}`],
        },
        tsc: {
            packageManager: 'pnpm',
            args: ['install', '--global', '@antfu/ni', `typescript@${version}`],
        },
    } satisfies ToolRegistry
    const { packageManager, args } = toolRegistry[toolName]

    if (packageManager === 'pnpm' && !installedTools.has(packageManager)) {
        const pnpmHome = join(homedir(), '.local/share/pnpm')

        process.env.PNPM_HOME = pnpmHome
        process.env.PATH = `${pnpmHome}:${env.PATH ?? ''}`

        installedTools.add(packageManager)
    }

    if (setupMap[packageManager].length !== 0 && !installedTools.has(packageManager)) {
        info(`[INSTALLER] Setting up the ${packageManager} environment`)

        for (const cmd of setupMap[packageManager]) await exec('sh', ['-c', cmd])

        installedTools.add(packageManager)
    }

    if (!installedTools.has(toolName)) {
        info(`[INSTALLER] Installing ${toolName} using ${packageManager}`)

        await exec(packageManager, args)

        installedTools.add(toolName)
    }
}
