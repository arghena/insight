import type { ToolName, ExecError } from '@/types'

const installedTools = new Set<ToolName>()
const promiseMap = new Map<ToolName, Promise<void>>()
const execErrors: ExecError[] = []

export function addInstalledTool(toolName: ToolName): void {
    installedTools.add(toolName)
}

export function hasInstalledTool(toolName: ToolName): boolean {
    return installedTools.has(toolName)
}

export function addPromise(toolName: ToolName, task: Promise<void>): void {
    promiseMap.set(toolName, task)
}

export function hasPromise(toolName: ToolName): boolean {
    return promiseMap.has(toolName)
}

export async function getPromise(toolName: ToolName): Promise<void> {
    const promise = promiseMap.get(toolName)

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
