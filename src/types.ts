import type { FormatterKey, LinterKey } from '@/map'

export type ToolRegistry = Record<InstallableToolName, ToolStep | ToolStep[]>

export interface ToolStep {
    packageManager: PackageManager
    args: string[]
}

export type SetupMap = Record<PackageManager, string[]>

export interface ActionContext {
    configPath: string
    isTitleCheckEnabled: boolean
    pullRequestTitle: string
    eventName: string
    token: string
    repository: string
    pullRequestNumber: number
}

export interface RunToolContext {
    loader: Loader
    toolType: ToolType
    version: string
    args: string[]
    paths: string[]
    log?: string
}

export type Loader = () => Promise<{ runner: Runner }>
export type Runner = (version: string, args: string[], paths: string[]) => Promise<void>

export interface InstallerOptions {
    hasEslintConfig?: boolean
    hasPackageJson?: boolean
}

export interface ExecOptions {
    toolName?: string
    toolType?: ToolType
    input?: string
}

export interface ExecError {
    toolName: string
    toolType: ToolType
    stderr: string
}

export type ToolType = 'formatter' | 'linter' | 'other'
export type PackageManager = 'npm' | 'rustup' | 'cargo-binstall' | 'uv' | 'docker'

export type InstallableToolName = FormatterKey | LinterKey

export type InstalledToolName = PackageManager | InstallableToolName
