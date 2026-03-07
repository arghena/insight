import { summary } from '@actions/core'
import type { ExecError } from '@/types'

export async function renderErrorSummary(execErrors: ExecError[]): Promise<void> {
    const sortedErrors = execErrors.toSorted((a, b) => {
        const typeCompare = a.toolType.localeCompare(b.toolType)

        return typeCompare === 0 ? a.toolName.localeCompare(b.toolName) : typeCompare
    })
    const tableRows = [
        [
            { data: 'Tool name', header: true },
            { data: 'Type', header: true },
        ],
        ...sortedErrors.map(({ toolName, toolType }) => [toolName, toolType]),
    ]

    summary.addHeading('Error Summary', 1)
    summary.addTable(tableRows)
    summary.addSeparator()
    summary.addHeading('Detailed Logs', 2)

    for (const { toolName, toolType, stderr } of sortedErrors) {
        summary.addDetails(`${toolName} (${toolType})`, `\n\n\`\`\`\n${stderr}\n\`\`\`\n\n`)
    }

    await summary.write()
}
