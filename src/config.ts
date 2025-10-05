import { info } from '@actions/core'
import { access, constants, readFile } from 'fs/promises'
import { parse } from 'smol-toml'
import { defu } from 'defu'
import ignore, { type Ignore } from 'ignore'
import { type CommitLinter } from './installer'
import { type FormatterKey, type LinterKey } from './map'

type Task = 'cargo_deny' | 'node_audit'

interface Config {
    match: {
        dot: boolean
    }
    pull_request: {
        check_title: boolean
        detect_changes: string[]
    }
    schedule: {
        tasks: Task[]
    }
    push_tag: {
        formatters: FormatterKey[]
        linters: LinterKey[]
    }
    args: {
        formatters: Record<FormatterKey, string[]>
        linters: Record<LinterKey | 'commitlint', string[]>
    }
    formatters: Record<FormatterKey, string[]>
    linters: Record<LinterKey, string[]>
    versions: Record<CommitLinter | FormatterKey | LinterKey, string>
}

async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK)

        return true
    } catch {
        return false
    }
}

const default_config: Config = {
    match: {
        dot: false,
    },
    pull_request: {
        check_title: false,
        detect_changes: [],
    },
    schedule: {
        tasks: [],
    },
    push_tag: {
        formatters: [],
        linters: [],
    },
    args: {
        formatters: {
            prettier: [],
            cargo_fmt: [],
            shfmt: [],
            taplo: [],
        },
        linters: {
            commitlint: [],
            cargo_deny: [],
            node_audit: [],
            check_dist: [],
            eslint: [],
            typos: [],
            yamllint: [],
            actionlint: [],
            ast_grep: [],
            cargo_clippy: [],
            cargo_msrv: [],
            cargo_tarpaulin: [],
            alex: [],
            markdownlint_cli2: [],
            vale: [],
            shellcheck: [],
            taplo: [],
        },
    },
    formatters: {
        prettier: [],
        cargo_fmt: [],
        shfmt: [],
        taplo: [],
    },
    linters: {
        cargo_deny: [],
        node_audit: [],
        check_dist: [],
        eslint: [],
        typos: [],
        yamllint: [],
        actionlint: [],
        ast_grep: [],
        cargo_clippy: [],
        cargo_msrv: [],
        cargo_tarpaulin: [],
        alex: [],
        markdownlint_cli2: [],
        vale: [],
        shellcheck: [],
        taplo: [],
    },
    versions: {
        commitlint_config_conventional: 'latest',
        commitlint: 'latest',
        cargo_deny: 'latest',
        node_audit: 'latest',
        check_dist: 'latest',
        prettier: 'latest',
        eslint: 'latest',
        typos: 'latest',
        yamllint: 'latest',
        actionlint: 'latest',
        ast_grep: 'latest',
        cargo_clippy: 'latest',
        cargo_fmt: 'latest',
        cargo_msrv: 'latest',
        cargo_tarpaulin: 'latest',
        alex: 'latest',
        markdownlint_cli2: 'latest',
        vale: 'latest',
        shfmt: 'latest',
        shellcheck: 'latest',
        taplo: 'latest',
    },
}

export async function resolveGitignore(): Promise<Ignore> {
    const gitignore_path = '.gitignore'
    const ig = ignore()

    if (await fileExists(gitignore_path)) {
        const contents = await readFile(gitignore_path, { encoding: 'utf8' })

        ig.add('.git')
        ig.add(contents)

        return ig
    } else {
        info(
            `[gitignore] No config file found at ${gitignore_path}, so only ignoring the .git directory.`,
        )

        ig.add(['.git'])

        return ig
    }
}

export async function resolveConfig(config_path: string): Promise<Config> {
    if (await fileExists(config_path)) {
        const contents = await readFile(config_path, { encoding: 'utf8' })
        const config = defu(parse(contents), default_config)

        return config as Config
    } else {
        info(
            `[config] The config file was not found at ${config_path}, using default settings instead.`,
        )

        return default_config
    }
}
