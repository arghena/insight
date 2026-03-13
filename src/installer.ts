import { info } from '@actions/core'
import { exec } from '@/exec'
import { addInstalledTool, hasInstalledTool } from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type {
    InstallableToolName,
    InstallerOptions,
    ToolStep,
    SetupMap,
    ToolRegistry,
} from '@/types'

export async function installer(
    toolName: InstallableToolName,
    version: string,
    options?: InstallerOptions,
): Promise<void> {
    const eslintArgs = ['install', '--global', '@antfu/ni', `eslint@${version}`]
    const trivySteps: ToolStep[] = [
        {
            packageManager: 'docker',
            args: ['pull', `ghcr.io/aquasecurity/trivy:${version}`],
        },
    ]

    if (options?.hasEslintConfig === true) {
        // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
        eslintArgs.push('jiti')
    }
    if (options?.hasPackageJson === true) {
        // https://trivy.dev/docs/latest/guide/coverage/language/nodejs/#pnpm
        trivySteps.push({
            packageManager: 'npm',
            args: ['install', '--global', '@antfu/ni'],
        })
    }

    const setupMap = {
        npm: [],
        rustup: [
            `rustup toolchain install ${version === 'latest' ? 'stable' : version} --profile minimal --no-self-update`,
            `rustup override set ${version === 'latest' ? 'stable' : version}`,
        ],
        'cargo-binstall': [
            'https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh',
        ],
        uv: ['https://github.com/astral-sh/uv/releases/latest/download/uv-installer.sh'],
        docker: [],
    } as const satisfies SetupMap
    const toolRegistry = {
        actionlint: [
            {
                packageManager: 'docker',
                args: ['pull', `rhysd/actionlint:${version}`],
            },
        ],
        alex: [
            {
                packageManager: 'npm',
                args: ['install', '--global', `alex@${version}`],
            },
        ],
        'ast-grep': [
            {
                packageManager: 'cargo-binstall',
                args: ['--no-confirm', version === 'latest' ? 'ast-grep' : `ast-grep@${version}`],
            },
        ],
        'cargo-clippy': [
            {
                packageManager: 'rustup',
                args: ['component', 'add', 'clippy'],
            },
        ],
        'cargo-deny': [
            {
                packageManager: 'cargo-binstall',
                args: [
                    '--no-confirm',
                    version === 'latest' ? 'cargo-deny' : `cargo-deny@${version}`,
                ],
            },
        ],
        'cargo-fmt': [
            {
                packageManager: 'rustup',
                args: ['component', 'add', 'rustfmt'],
            },
        ],
        'cargo-msrv': [
            {
                packageManager: 'cargo-binstall',
                args: [
                    '--no-confirm',
                    version === 'latest' ? 'cargo-msrv' : `cargo-msrv@${version}`,
                ],
            },
        ],
        'check-dist': [
            {
                packageManager: 'npm',
                args: ['install', '--global', '@antfu/ni'],
            },
        ],
        eslint: [
            {
                packageManager: 'npm',
                args: eslintArgs,
            },
        ],
        'markdownlint-cli2': [
            {
                packageManager: 'npm',
                args: ['install', '--global', `markdownlint-cli2@${version}`],
            },
        ],
        'node-audit': [
            {
                packageManager: 'npm',
                args: ['install', '--global', '@antfu/ni'],
            },
        ],
        prettier: [
            {
                packageManager: 'npm',
                args: ['install', '--global', `prettier@${version}`],
            },
        ],
        shellcheck: [
            {
                packageManager: 'docker',
                args: ['pull', `koalaman/shellcheck:${version}`],
            },
        ],
        shfmt: [
            {
                packageManager: 'docker',
                args: ['pull', `mvdan/shfmt:${version}`],
            },
        ],
        tombi: [
            {
                packageManager: 'uv',
                args: ['tool', 'install', `tombi@${version}`],
            },
        ],
        trivy: trivySteps,
        tsc: [
            {
                packageManager: 'npm',
                args: ['install', '--global', '@antfu/ni', `typescript@${version}`],
            },
        ],
        typos: [
            {
                packageManager: 'cargo-binstall',
                args: ['--no-confirm', version === 'latest' ? 'typos-cli' : `typos-cli@${version}`],
            },
        ],
        vale: [
            {
                packageManager: 'docker',
                args: ['pull', `jdkato/vale:${version}`],
            },
        ],
        yamllint: [
            {
                packageManager: 'uv',
                args: ['tool', 'install', `yamllint@${version}`],
            },
        ],
    } as const satisfies ToolRegistry
    const steps = toolRegistry[toolName]

    if (!hasInstalledTool(toolName)) {
        for (const { packageManager, args } of steps) {
            if (setupMap[packageManager].length !== 0 && !hasInstalledTool(packageManager)) {
                info(`[INSTALLER] Setting up the ${packageManager} environment`)

                for (const setup of setupMap[packageManager]) {
                    await exec('sh', [], {
                        input: isValidHttpsUrl(setup) ? await fetchText(setup) : setup,
                    })
                }

                addInstalledTool(packageManager)
            }

            info(`[INSTALLER] Installing ${toolName} using ${packageManager}`)

            await exec(packageManager, args)
        }

        addInstalledTool(toolName)
    }
}
