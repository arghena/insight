import type { ToolName, ExecError } from '@/types'

const installedTools = new Set<ToolName>()
const setupPromises = new Map<ToolName, Promise<void>>()
const execErrors: ExecError[] = []

export function addInstalledTool(toolName: ToolName): void {
    installedTools.add(toolName)
}

export function hasInstalledTool(toolName: ToolName): boolean {
    return installedTools.has(toolName)
}

export function addSetupPromise(toolName: ToolName, installTask: Promise<void>): void {
    setupPromises.set(toolName, installTask)
}

export function hasSetupPromise(toolName: ToolName): boolean {
    return setupPromises.has(toolName)
}

export async function getSetupPromise(toolName: ToolName): Promise<void> {
    const promise = setupPromises.get(toolName)

    if (!promise) {
        throw new Error(`[SETUP] Setup promise missing for ${toolName}`)
    }

    await promise
}

export function addExecError(error: ExecError): void {
    execErrors.push(error)
}

export function getExecErrors(): ExecError[] {
    return [...execErrors]
}
