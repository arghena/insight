import { cwd } from 'node:process'
import type { ToolName } from '@/types'

export function buildDockerRunArgs(imageName: string): string[] {
    return ['run', '--rm', '-v', `${cwd()}:/mnt`, '-w', '/mnt', imageName]
}

export function buildNpmArgs(...packageNames: string[]): string[] {
    return ['install', '--global', ...packageNames]
}

export function buildRustupArgs(...componentNames: string[]): string[] {
    return ['component', 'add', ...componentNames]
}

export function buildBinstallArgs(...packageNames: string[]): string[] {
    return ['--no-confirm', ...packageNames]
}

export function buildUvArgs(...packageNames: string[]): string[] {
    return ['tool', 'install', ...packageNames]
}

export function buildDockerArgs(...imageNames: string[]): string[] {
    return ['pull', ...imageNames]
}

export function getBinstallPackageName(toolName: ToolName, version: string): string {
    const isLatest = version === 'latest'

    if (toolName === 'typos') {
        const packageName = `${toolName}-cli`

        return isLatest ? packageName : `${packageName}@${version}`
    }

    return isLatest ? toolName : `${toolName}@${version}`
}

export function buildEmptyArrays<K extends string>(keys: K[]): Record<K, never[]> {
    return buildRecord(keys, () => [])
}

export function buildLatestVersions<K extends string>(keys: K[]): Record<K, string> {
    return buildRecord(keys, () => 'latest')
}

function buildRecord<K extends string, V>(keys: K[], value: (key: K) => V): Record<K, V> {
    return Object.fromEntries(keys.map((k): [K, V] => [k, value(k)])) as Record<K, V>
}
