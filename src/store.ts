import type { ToolName, ExecKey, ExecError } from '@/types'

const setupPromiseMap = new Map<ToolName, Promise<void>>()
const execPromiseMap = new Map<ExecKey, Promise<number>>()
const execErrors: ExecError[] = []

export function addSetupPromise(toolName: ToolName, task: Promise<void>): void {
    setupPromiseMap.set(toolName, task)
}

export function hasSetupPromise(toolName: ToolName): boolean {
    return setupPromiseMap.has(toolName)
}

export async function getSetupPromise(toolName: ToolName): Promise<void> {
    const promise = setupPromiseMap.get(toolName)

    if (!promise) {
        throw new Error(`[PROMISE] Missing setup promise for ${toolName}`)
    }

    await promise
}

export function addExecPromise(key: ExecKey, task: Promise<number>): void {
    execPromiseMap.set(key, task)
}

export function hasExecPromise(key: ExecKey): boolean {
    return execPromiseMap.has(key)
}

export async function getExecPromise(key: ExecKey): Promise<void> {
    const promise = execPromiseMap.get(key)

    if (!promise) {
        throw new Error(`[PROMISE] Missing exec promise for ${key}`)
    }

    await promise
}

export function addExecError(error: ExecError): void {
    execErrors.push(error)
}

export function getExecErrors(): ExecError[] {
    return [...execErrors]
}
