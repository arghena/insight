import type { ToolName, PromiseType, ExecError } from '@/types'

const installedTools = new Set<ToolName>()
const setupPromiseMap = new Map<ToolName, Promise<void>>()
const execPromiseMap = new Map<ToolName, Promise<void>>()
const execErrors: ExecError[] = []

export function addInstalledTool(toolName: ToolName): void {
    installedTools.add(toolName)
}

export function hasInstalledTool(toolName: ToolName): boolean {
    return installedTools.has(toolName)
}

export function addPromise(
    toolName: ToolName,
    promiseType: PromiseType,
    installTask: Promise<void>,
): void {
    if (promiseType === 'setup') {
        setupPromiseMap.set(toolName, installTask)
    } else {
        execPromiseMap.set(toolName, installTask)
    }
}

export function hasPromise(toolName: ToolName, promiseType: PromiseType): boolean {
    if (promiseType === 'setup') {
        return setupPromiseMap.has(toolName)
    }

    return execPromiseMap.has(toolName)
}

export async function getPromise(toolName: ToolName, promiseType: PromiseType): Promise<void> {
    const targetPromiseMap = promiseType === 'setup' ? setupPromiseMap : execPromiseMap
    const promise = targetPromiseMap.get(toolName)

    if (!promise) {
        throw new Error(`[PROMISE] Missing promise for ${toolName}`)
    }

    await promise
}

export function addExecError(error: ExecError): void {
    execErrors.push(error)
}

export function getExecErrors(): ExecError[] {
    return [...execErrors]
}
