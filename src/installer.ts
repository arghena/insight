import { exec } from '@/exec'
import {
    addInstalledTool,
    hasInstalledTool,
    addSetupPromise,
    hasSetupPromise,
    getSetupPromise,
} from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type { ToolName, InstallerOptions, ToolStep, ToolRegistry } from '@/types'

export async function installer(
    toolName: ToolName,
    version: string,
    options?: InstallerOptions,
): Promise<void> {
    if (hasInstalledTool(toolName)) {
        return
    }
    if (hasSetupPromise(toolName)) {
        await getSetupPromise(toolName)

        return
    }

    const installTask = (async (): Promise<void> => {
        const steps = getToolSteps(toolName, version, options)

        for (const step of steps) {
            if ('script' in step) {
                const content = isValidHttpsUrl(step.script)
                    ? await fetchText(step.script)
                    : step.script

                await exec('sh', [], { input: content })
            } else {
                const { packageManager, args } = step

                await installer(packageManager, version, options)

                if (packageManager !== 'ni') {
                    await exec(packageManager, args)
                }
            }
        }

        addInstalledTool(toolName)
    })()

    addSetupPromise(toolName, installTask)

    await installTask
}

function getToolSteps(toolName: ToolName, version: string, options?: InstallerOptions): ToolStep[] {
    const toolRegistry = {
        npm: [],
        rustup: [
            { script: `rustup toolchain install ${version} --profile minimal --no-self-update` },
            { script: `rustup override set ${version}` },
        ],
        'cargo-binstall': {
            script: 'https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh',
        },
        uv: {
            script: 'https://github.com/astral-sh/uv/releases/latest/download/uv-installer.sh',
        },
        docker: [],
        ni: { script: `npm ${buildNpmArgs('@antfu/ni').join(' ')}` },

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
            packageManager: 'ni',
            args: [],
        },
        eslint: [
            {
                packageManager: 'npm',
                // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
                args: buildNpmArgs(
                    `eslint@${version}`,
                    ...(options?.hasTsEslintConfig === true ? ['jiti'] : []),
                ),
            },
            {
                packageManager: 'ni',
                args: [],
            },
        ],
        'markdownlint-cli2': {
            packageManager: 'npm',
            args: buildNpmArgs(`markdownlint-cli2@${version}`),
        },
        'node-audit': {
            packageManager: 'ni',
            args: [],
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
        trivy: [
            {
                packageManager: 'docker',
                args: buildDockerArgs(`ghcr.io/aquasecurity/trivy:${version}`),
            },
            ...(options?.hasPackageJson === true
                ? [
                      {
                          packageManager: 'ni',
                          args: [],
                      } satisfies ToolStep,
                  ]
                : []),
        ],
        tsc: [
            {
                packageManager: 'npm',
                args: buildNpmArgs(`typescript@${version}`),
            },
            {
                packageManager: 'ni',
                args: [],
            },
        ],
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

function getBinstallPackageName(toolName: ToolName, version: string): string {
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
