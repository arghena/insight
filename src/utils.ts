import { cwd } from 'node:process'

export function buildDockerRunArgs(imageName: string): string[] {
    return ['run', '--rm', '-v', `${cwd()}:/mnt`, '-w', '/mnt', imageName]
}

export function unorderedList(items: string[]): string {
    return items.map((item) => `- ${item}`).join('\n')
}

// https://github.com/microsoft/TypeScript/issues/14520
export function isIncluded<T extends string>(value: string, values: T[]): value is T {
    return values.includes(value as T)
}

export function getKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
}
