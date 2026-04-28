import { access, constants } from 'node:fs/promises'
import type { ToolModule } from '@/types'

export function defineTool(config: ToolModule): ToolModule {
    return config
}

export async function fileExists(...paths: string[]): Promise<boolean> {
    try {
        const checks = paths.map((p) => access(p, constants.F_OK))

        await Promise.any(checks)

        return true
    } catch {
        return false
    }
}

export function getKeys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
}

// https://github.com/microsoft/TypeScript/issues/14520
export function isIncluded<T extends string>(value: string, values: T[]): value is T {
    return values.includes(value as T)
}
