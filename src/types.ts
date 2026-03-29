import type { FormatterKey, LinterKey } from '@/registries'

export type ToolStep =
    | {
          packageManager: PackageManager
          args: string[]
      }
    | {
          script: `https://${string}`
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

export interface RunToolContext extends RunnerContext {
    loader: Loader
    toolType: ToolType
}

export type Loader = () => Promise<{ runner: Runner }>
export type Runner = (runnerContext: RunnerContext) => Promise<number>

export interface RunnerContext {
    version: string
    args: string[]
    paths: string[]
}

export type ToolStepBuilder = (toolStepBuilderContext: ToolStepBuilderContext) => ToolStep[]

export interface ToolStepBuilderContext {
    toolName: ToolName
    version: string
    options?: InstallerOptions
}

export interface InstallerOptions {
    hasTsEslintConfig?: boolean
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

export type ExecKey = `${ToolName}:${string}`

export type ToolName = PackageManager | FormatterKey | LinterKey

export type ToolType = 'formatter' | 'linter' | 'other'
export type PackageManager = 'cargo-binstall' | 'docker' | 'nci' | 'npm' | 'rustup' | 'uv'
