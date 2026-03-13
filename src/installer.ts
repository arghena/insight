import { info } from '@actions/core'
import { exec } from '@/exec'
import { addInstalledTool, hasInstalledTool } from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type {
    InstallableToolName,
    InstallerOptions,
    ToolStep,
    SetupMap,
    PackageManager,
    ToolRegistry,
} from '@/types'

export async function installer(
    toolName: InstallableToolName,
    version: string,
    options?: InstallerOptions,
): Promise<void> {
    if (hasInstalledTool(toolName)) {
        return
    }

    const steps = getToolSteps(toolName, version, options)

    for (const { packageManager, args } of steps) {
        await ensurePackageManager(packageManager, version)

        info(`[INSTALLER] Setting up the ${toolName} tool`)

        await exec(packageManager, args)
    }

    addInstalledTool(toolName)
}

function getToolSteps(
    toolName: InstallableToolName,
    version: string,
    options?: InstallerOptions,
): ToolStep[] {
    const eslintArgs = buildNpmArgs('@antfu/ni', `eslint@${version}`)
    const trivySteps: ToolStep[] = [
        {
            packageManager: 'docker',
            args: buildDockerArgs(`ghcr.io/aquasecurity/trivy:${version}`),
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
            args: buildNpmArgs('@antfu/ni'),
        })
    }

    const toolRegistry = {
        actionlint: {
            packageManager: 'docker',
            args: buildDockerArgs(`rhysd/${toolName}:${version}`),
        },
        alex: {
            packageManager: 'npm',
            args: buildNpmArgs(`alex@${version}`),
        },
        'ast-grep': {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
        'cargo-clippy': {
            packageManager: 'rustup',
            args: buildRustupArgs('clippy'),
        },
        'cargo-deny': {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
        'cargo-fmt': {
            packageManager: 'rustup',
            args: buildRustupArgs('rustfmt'),
        },
        'cargo-msrv': {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
        'check-dist': {
            packageManager: 'npm',
            args: buildNpmArgs('@antfu/ni'),
        },
        eslint: {
            packageManager: 'npm',
            args: eslintArgs,
        },
        'markdownlint-cli2': {
            packageManager: 'npm',
            args: buildNpmArgs(`markdownlint-cli2@${version}`),
        },
        'node-audit': {
            packageManager: 'npm',
            args: buildNpmArgs('@antfu/ni'),
        },
        prettier: {
            packageManager: 'npm',
            args: buildNpmArgs(`prettier@${version}`),
        },
        shellcheck: {
            packageManager: 'docker',
            args: buildDockerArgs(`koalaman/${toolName}:${version}`),
        },
        shfmt: {
            packageManager: 'docker',
            args: buildDockerArgs(`mvdan/${toolName}:${version}`),
        },
        tombi: {
            packageManager: 'uv',
            args: buildUvArgs(`${toolName}@${version}`),
        },
        trivy: trivySteps,
        tsc: {
            packageManager: 'npm',
            args: buildNpmArgs('@antfu/ni', `typescript@${version}`),
        },
        typos: {
            packageManager: 'cargo-binstall',
            args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
        },
        vale: {
            packageManager: 'docker',
            args: buildDockerArgs(`jdkato/${toolName}:${version}`),
        },
        yamllint: {
            packageManager: 'uv',
            args: buildUvArgs(`${toolName}@${version}`),
        },
    } as const satisfies ToolRegistry
    const steps = toolRegistry[toolName]

    return Array.isArray(steps) ? steps : [steps]
}

function buildNpmArgs(...packageNames: string[]): string[] {
    return ['install', '--global', ...packageNames]
}

function buildRustupArgs(...componentNames: string[]): string[] {
    return ['component', 'add', ...componentNames]
}

function buildBinstallArgs(...packageNames: string[]): string[] {
    return ['--no-confirm', ...packageNames]
}

function getBinstallPackageName(toolName: InstallableToolName, version: string): string {
    const isLatest = version === 'latest'

    switch (toolName) {
        case 'typos': {
            const packageName = `${toolName}-cli`

            return isLatest ? packageName : `${packageName}@${version}`
        }
        default:
            return isLatest ? toolName : `${toolName}@${version}`
    }
}

function buildUvArgs(...packageNames: string[]): string[] {
    return ['tool', 'install', ...packageNames]
}

function buildDockerArgs(...imageNames: string[]): string[] {
    return ['pull', ...imageNames]
}

async function ensurePackageManager(
    packageManager: PackageManager,
    version: string,
): Promise<void> {
    if (hasInstalledTool(packageManager)) {
        return
    }

    const setupMap = {
        npm: [],
        rustup: [
            `rustup toolchain install ${version} --profile minimal --no-self-update`,
            `rustup override set ${version}`,
        ],
        'cargo-binstall': [
            'https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh',
        ],
        uv: ['https://github.com/astral-sh/uv/releases/latest/download/uv-installer.sh'],
        docker: [],
    } as const satisfies SetupMap
    const setupScripts = setupMap[packageManager]

    if (setupScripts.length > 0) {
        info(`[INSTALLER] Setting up the ${packageManager} environment`)

        for (const script of setupScripts) {
            await exec('sh', [], {
                input: isValidHttpsUrl(script) ? await fetchText(script) : script,
            })
        }
    }

    addInstalledTool(packageManager)
}
