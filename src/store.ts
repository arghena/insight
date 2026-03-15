import type { ToolName, PromiseType, ExecError } from '@/types'

const installedTools = new Set<ToolName>()
const setupPromises = new Map<ToolName, Promise<void>>()
const execPromises = new Map<ToolName, Promise<void>>()
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
        setupPromises.set(toolName, installTask)
    } else {
        execPromises.set(toolName, installTask)
    }
}

export function hasPromise(toolName: ToolName, promiseType: PromiseType): boolean {
    if (promiseType === 'setup') {
        return setupPromises.has(toolName)
    }

    return execPromises.has(toolName)
}

export async function getPromise(toolName: ToolName, promiseType: PromiseType): Promise<void> {
    // prettier-ignore
    const promise = promiseType === 'setup' ? setupPromises.get(toolName) : execPromises.get(toolName)

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
