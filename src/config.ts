import { warning } from '@actions/core'
import { access, constants, readFile } from 'fs/promises'
import { parse } from 'smol-toml'
import { defu } from 'defu'
import ignore, { type Ignore } from 'ignore'
import { type ToolName } from './installer'
import { type FormatterKey, type LinterKey } from './map'

interface Config {
    match: {
        dot: boolean
    }
    changes: Record<string, string[]>
    schedule: {
        linters: ('cargo-deny' | 'node-audit')[]
    }
    push: {
        formatters: FormatterKey[]
        linters: LinterKey[]
    }
    args: {
        formatters: Record<FormatterKey, string[]>
        linters: Record<LinterKey | 'commitlint', string[]>
    }
    formatters: Record<FormatterKey, string[]>
    linters: Record<LinterKey, string[]>
    versions: Record<ToolName, string>
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK)

        return true
    } catch {
        return false
    }
}

const defaultConfig: Config = {
    match: {
        dot: false,
    },
    changes: {},
    schedule: {
        linters: [],
    },
    push: {
        formatters: [],
        linters: [],
    },
    args: {
        formatters: {
            prettier: [],
            'cargo-fmt': [],
            shfmt: [],
            taplo: [],
            tombi: [],
        },
        linters: {
            commitlint: [],
            'cargo-deny': [],
            'node-audit': [],
            'check-dist': [],
            eslint: [],
            typos: [],
            yamllint: [],
            actionlint: [],
            'ast-grep': [],
            'cargo-clippy': [],
            'cargo-msrv': [],
            'cargo-tarpaulin': [],
            alex: [],
            'markdownlint-cli2': [],
            vale: [],
            shellcheck: [],
            taplo: [],
            tombi: [],
        },
    },
    formatters: {
        prettier: [],
        'cargo-fmt': [],
        shfmt: [],
        taplo: [],
        tombi: [],
    },
    linters: {
        'cargo-deny': [],
        'node-audit': [],
        'check-dist': [],
        eslint: [],
        typos: [],
        yamllint: [],
        actionlint: [],
        'ast-grep': [],
        'cargo-clippy': [],
        'cargo-msrv': [],
        'cargo-tarpaulin': [],
        alex: [],
        'markdownlint-cli2': [],
        vale: [],
        shellcheck: [],
        taplo: [],
        tombi: [],
    },
    versions: {
        'commitlint-config-conventional': 'latest',
        commitlint: 'latest',
        'cargo-deny': 'latest',
        'node-audit': 'latest',
        'check-dist': 'latest',
        prettier: 'latest',
        eslint: 'latest',
        typos: 'latest',
        yamllint: 'latest',
        actionlint: 'latest',
        'ast-grep': 'latest',
        'cargo-clippy': 'latest',
        'cargo-fmt': 'latest',
        'cargo-msrv': 'latest',
        'cargo-tarpaulin': 'latest',
        alex: 'latest',
        'markdownlint-cli2': 'latest',
        vale: 'latest',
        shfmt: 'latest',
        shellcheck: 'latest',
        taplo: 'latest',
        tombi: 'latest',
    },
}

export async function resolveGitignore(): Promise<Ignore> {
    const gitignorePath = '.gitignore'
    const ig = ignore()

    if (await fileExists(gitignorePath)) {
        const contents = await readFile(gitignorePath, { encoding: 'utf8' })

        ig.add('.git')
        ig.add(contents)

        return ig
    } else {
        warning(
            `[GITIGNORE] No config file found at ${gitignorePath}, so only ignoring the .git directory.`,
        )

        ig.add(['.git'])

        return ig
    }
}

export async function resolveConfig(configPath: string): Promise<Config> {
    if (await fileExists(configPath)) {
        const contents = await readFile(configPath, { encoding: 'utf8' })
        const config = defu(parse(contents), defaultConfig)

        return config as Config
    } else {
        warning(
            `[CONFIG] The config file was not found at ${configPath}, using default settings instead.`,
        )

        return defaultConfig
    }
}
