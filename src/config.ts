import { access, constants, readFile } from 'node:fs/promises'
import { parse } from 'smol-toml'
import { defu } from 'defu'
import { HttpClient } from '@actions/http-client'
import ignore, { type Ignore } from 'ignore'
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

interface Context {
    repository: string
    refName: string
}

const defaultConfig: Config = {
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
}

export async function resolveConfig(configPath: string, context: Context): Promise<Config> {
    let rawConfig: string

    if (await fileExists(configPath)) {
        rawConfig = await readFile(configPath, { encoding: 'utf8' })
    } else {
        const { repository, refName } = context

        rawConfig = await fetchText(
            `https://raw.githubusercontent.com/${repository}/refs/heads/${refName}/${configPath}`,
        )
    }

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

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK)

        return true
    } catch {
        return false
    }
}

async function fetchText(url: string): Promise<string> {
    const client = new HttpClient('arghena/insight')
    const res = await client.get(url)
    const { statusCode } = res.message

    if (statusCode !== 200) {
        throw new Error(
            `[REQUEST] Unexpected ${String(statusCode ?? 'unknown')} when accessing ${url}`,
        )
    }

    return await res.readBody()
}
