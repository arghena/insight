import { cwd } from 'node:process'
import { access, constants } from 'node:fs/promises'
import { exec } from '@/exec'
import { hasNciPromise, getNciPromise, addNciPromise } from '@/store'

export async function ensureNci(): Promise<void> {
    if (hasNciPromise()) {
        await getNciPromise()

        return
    }

    const task = exec('nci')

    addNciPromise(task)

    await task
}

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

export async function fileExists(...paths: string[]): Promise<boolean> {
    try {
        // eslint-disable-next-line @typescript-eslint/promise-function-async
        const checks = paths.map((p) => access(p, constants.F_OK))

        await Promise.any(checks)

        return true
    } catch {
        return false
    }
}
