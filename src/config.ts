import { readFile } from 'node:fs/promises'
import { parse } from 'smol-toml'
import { defu } from 'defu'
import { actionContext } from '@/github'
import { formatterKeys, linterKeys } from '@/map'
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

function buildEmptyArrays<K extends string>(keys: K[]): Record<K, never[]> {
    return buildRecord(keys, () => [])
}

function buildLatestVersions<K extends string>(keys: K[]): Record<K, string> {
    return buildRecord(keys, () => 'latest')
}

function buildRecord<K extends string, V>(keys: K[], value: (key: K) => V): Record<K, V> {
    return Object.fromEntries(keys.map((k): [K, V] => [k, value(k)])) as Record<K, V>
}
