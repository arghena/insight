export function unorderedList(items: string[]): string {
    return items.map((item) => `- ${item}`).join('\n')
}
