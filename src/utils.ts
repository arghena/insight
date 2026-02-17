import { access, constants } from 'node:fs/promises'

export function unorderedList(items: string[]): string {
    return items.map((item) => `- ${item}`).join('\n')
}

export async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK)

        return true
    } catch {
        return false
    }
}
