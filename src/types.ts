import type { FormatterKey, LinterKey } from '@/map'

export type ToolRegistry = Record<ToolName, ToolStep | ToolStep[]>

export type ToolStep =
    | {
          packageManager: PackageManager
          args: string[]
      }
    | {
          script: string
      }

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
}

export type Loader = () => Promise<{ runner: Runner }>
export type Runner = (version: string, args: string[], paths: string[]) => Promise<void>

export interface InstallerOptions {
    hasTsEslintConfig?: boolean
    hasPackageJson?: boolean
}

export interface ExecOptions {
    toolName?: string
    toolType?: ToolType
    input?: string
    stderr?: boolean
}

export interface ExecError {
    toolName: string
    toolType: ToolType
    stderr: string
}

export type ToolName = PackageManager | FormatterKey | LinterKey

export type ToolType = 'formatter' | 'linter' | 'other'
export type PackageManager = 'npm' | 'rustup' | 'cargo-binstall' | 'uv' | 'docker'
