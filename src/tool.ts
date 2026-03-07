import { info, group } from '@actions/core'
import { unorderedList } from '@/utils'
import type { RunToolContext } from '@/types'

export async function runTool({
    loader,
    toolType,
    version,
    args,
    paths,
    log,
}: RunToolContext): Promise<void> {
    await group(`[${toolType.toUpperCase()}] ${loader.name}`, async () => {
        const { runner } = await loader()

        info(log ?? `[GLOB] Matched file paths:\n${unorderedList(paths)}`)

        await runner(version, args, paths)
    })
}
