import { exec } from '@/exec'
import {
    addInstalledTool,
    hasInstalledTool,
    addSetupPromise,
    hasSetupPromise,
    getSetupPromise,
    addExecPromise,
    hasExecPromise,
    getExecPromise,
} from '@/store'
import { fetchText, isValidHttpsUrl } from '@/fetch'
import type { ToolName, InstallerOptions, ToolStep } from '@/types'

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

                if (packageManager === 'nci') {
                    await execOnce(packageManager, args)
                } else {
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
    switch (toolName) {
        case 'npm':
            return []
        case 'rustup':
            return [
                {
                    script: `rustup toolchain install ${version} --profile minimal --no-self-update`,
                },
                { script: `rustup override set ${version}` },
            ]
        case 'cargo-binstall':
            return [
                {
                    script: 'https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh',
                },
            ]
        case 'uv':
            return [
                {
                    script: 'https://github.com/astral-sh/uv/releases/latest/download/uv-installer.sh',
                },
            ]
        case 'docker':
            return []
        case 'nci':
            return [{ script: `npm ${buildNpmArgs('@antfu/ni').join(' ')}` }]
        case 'actionlint':
            return [
                {
                    packageManager: 'docker',
                    args: buildDockerArgs(`rhysd/${toolName}:${version}`),
                },
            ]
        case 'alex':
            return [
                {
                    packageManager: 'npm',
                    args: buildNpmArgs(`alex@${version}`),
                },
            ]
        case 'ast-grep':
            return [
                {
                    packageManager: 'cargo-binstall',
                    args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
                },
            ]
        case 'cargo-clippy':
            return [
                {
                    packageManager: 'rustup',
                    args: buildRustupArgs('clippy'),
                },
            ]
        case 'cargo-deny':
            return [
                {
                    packageManager: 'cargo-binstall',
                    args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
                },
            ]
        case 'cargo-fmt':
            return [
                {
                    packageManager: 'rustup',
                    args: buildRustupArgs('rustfmt'),
                },
            ]
        case 'cargo-msrv':
            return [
                {
                    packageManager: 'cargo-binstall',
                    args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
                },
            ]
        case 'check-dist':
            return [
                {
                    packageManager: 'nci',
                    args: [],
                },
            ]
        case 'eslint':
            return [
                {
                    packageManager: 'npm',
                    // https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
                    args: buildNpmArgs(
                        `eslint@${version}`,
                        ...(options?.hasTsEslintConfig === true ? ['jiti'] : []),
                    ),
                },
                {
                    packageManager: 'nci',
                    args: [],
                },
            ]
        case 'markdownlint-cli2':
            return [
                {
                    packageManager: 'npm',
                    args: buildNpmArgs(`markdownlint-cli2@${version}`),
                },
            ]
        case 'node-audit':
            return [
                {
                    packageManager: 'nci',
                    args: [],
                },
            ]
        case 'prettier':
            return [
                {
                    packageManager: 'npm',
                    args: buildNpmArgs(`prettier@${version}`),
                },
            ]
        case 'shellcheck':
            return [
                {
                    packageManager: 'docker',
                    args: buildDockerArgs(`koalaman/${toolName}:${version}`),
                },
            ]
        case 'shfmt':
            return [
                {
                    packageManager: 'docker',
                    args: buildDockerArgs(`mvdan/${toolName}:${version}`),
                },
            ]
        case 'tombi':
            return [
                {
                    packageManager: 'uv',
                    args: buildUvArgs(`${toolName}@${version}`),
                },
            ]
        case 'trivy':
            return [
                {
                    packageManager: 'docker',
                    args: buildDockerArgs(`ghcr.io/aquasecurity/trivy:${version}`),
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
            ]
        case 'tsc':
            return [
                {
                    packageManager: 'npm',
                    args: buildNpmArgs(`typescript@${version}`),
                },
                {
                    packageManager: 'nci',
                    args: [],
                },
            ]
        case 'typos':
            return [
                {
                    packageManager: 'cargo-binstall',
                    args: buildBinstallArgs(getBinstallPackageName(toolName, version)),
                },
            ]
        case 'vale':
            return [
                {
                    packageManager: 'docker',
                    args: buildDockerArgs(`jdkato/${toolName}:${version}`),
                },
            ]
        case 'yamllint':
            return [
                {
                    packageManager: 'uv',
                    args: buildUvArgs(`${toolName}@${version}`),
                },
            ]
    }
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

    if (toolName === 'typos') {
        const packageName = `${toolName}-cli`

        return isLatest ? packageName : `${packageName}@${version}`
    }

    return isLatest ? toolName : `${toolName}@${version}`
}

function buildUvArgs(...packageNames: string[]): string[] {
    return ['tool', 'install', ...packageNames]
}

function buildDockerArgs(...imageNames: string[]): string[] {
    return ['pull', ...imageNames]
}

async function execOnce(toolName: ToolName, args?: string[]): Promise<void> {
    if (hasExecPromise(toolName)) {
        await getExecPromise(toolName)

        return
    }

    const task = exec(toolName, args)

    addExecPromise(toolName, task)

    await task
}
