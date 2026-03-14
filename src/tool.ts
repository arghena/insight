import type { RunToolContext } from '@/types'

export async function runTool({ loader, version, args, paths }: RunToolContext): Promise<void> {
    const { runner } = await loader()

    await runner(version, args, paths)
}
