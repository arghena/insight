import { readFile } from 'node:fs/promises'
import { parse } from 'smol-toml'
import { defu } from 'defu'
import ignore, { type Ignore } from 'ignore'
import { fileExists } from '@/utils'
import { actionContext, getFileContent } from '@/github'
import { type ToolName } from '@/installer'
import { type FormatterKey, type LinterKey } from '@/map'

interface Config {
    match: {
        dot: boolean
    }
    schedule: {
        linters: ('cargo-deny' | 'node-audit')[]
    }
    push: {
        formatters: FormatterKey[]
        linters: LinterKey[]
    }
    formatters: Record<FormatterKey, string[]>
    linters: Record<LinterKey, string[]>
    args: {
        formatters: Record<FormatterKey, string[]>
        linters: Record<LinterKey | 'commitlint', string[]>
    }
    versions: Record<ToolName, string>
}

const defaultConfig = {
    match: {
        dot: false,
    },
    schedule: {
        linters: [],
    },
    push: {
        formatters: [],
        linters: [],
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
        tsc: [],
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
            tsc: [],
        },
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
        tsc: 'latest',
    },
} satisfies Config

export async function resolveConfig(): Promise<Config> {
    const { configPath } = actionContext
    const rawConfig = (await fileExists(configPath))
        ? await readFile(configPath, { encoding: 'utf8' })
        : await getFileContent(configPath)

    return defu(parse(rawConfig), defaultConfig) as Config
}

export async function resolveGitignore(): Promise<Ignore> {
    const gitignorePath = '.gitignore'
    const ig = ignore().add('.git')

    if (await fileExists(gitignorePath)) {
        ig.add(await readFile(gitignorePath, { encoding: 'utf8' }))
    }

    return ig
}
