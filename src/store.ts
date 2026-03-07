import type { InstalledToolName, ExecError } from '@/types'

const installedTools = new Set<InstalledToolName>()
const execErrors: ExecError[] = []

export function addInstalledTool(toolName: InstalledToolName): void {
    installedTools.add(toolName)
}

export function hasInstalledTool(toolName: InstalledToolName): boolean {
    return installedTools.has(toolName)
}

export function addExecError(error: ExecError): void {
    execErrors.push(error)
}

export function getExecErrors(): ExecError[] {
    return [...execErrors]
}
