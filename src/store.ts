import type { InstalledToolName, ExecError } from '@/types'

const installedTools = new Set<InstalledToolName>()
const setupPromises = new Map<InstalledToolName, Promise<void>>()
const execErrors: ExecError[] = []
let nciPromise: Promise<void> | null = null

export function addInstalledTool(toolName: InstalledToolName): void {
    installedTools.add(toolName)
}

export function hasInstalledTool(toolName: InstalledToolName): boolean {
    return installedTools.has(toolName)
}

export function addSetupPromise(toolName: InstalledToolName, installTask: Promise<void>): void {
    setupPromises.set(toolName, installTask)
}

export function hasSetupPromise(toolName: InstalledToolName): boolean {
    return setupPromises.has(toolName)
}

export async function getSetupPromise(toolName: InstalledToolName): Promise<void> {
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

export function hasNciPromise(): boolean {
    return nciPromise !== null
}

export async function getNciPromise(): Promise<void> {
    if (!nciPromise) {
        throw new Error('[STORE] NCI promise is missing')
    }

    await nciPromise
}

export function addNciPromise(promise: Promise<void>): void {
    nciPromise = promise
}
