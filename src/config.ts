import { readFile } from 'node:fs/promises'
import { parse } from 'smol-toml'
import { defu } from 'defu'
import { actionContext } from '@/github'
import { formatterKeys, linterKeys } from '@/registries'
import { buildEmptyArrays, buildLatestVersions } from '@/builders'
import { configSchema, type Config } from '@/schemas'

const { configPath } = actionContext
const defaultConfig = {
    match: {
        dot: false,
    },
    schedule: {
        linters: [],
    },
    formatters: buildEmptyArrays(formatterKeys),
    linters: buildEmptyArrays(linterKeys),
    args: {
        formatters: buildEmptyArrays(formatterKeys),
        linters: buildEmptyArrays(linterKeys),
    },
    versions: buildLatestVersions([...formatterKeys, ...linterKeys]),
} as const satisfies Config

export async function resolveConfig(): Promise<Config> {
    const rawConfig = await readFile(configPath, { encoding: 'utf8' })
    const parsed = parse(rawConfig)
    const merged = defu(parsed, defaultConfig)
    const validConfig = configSchema.parse(merged)

    return validConfig
}
