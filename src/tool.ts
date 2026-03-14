import { performance } from 'node:perf_hooks'
import { info } from '@actions/core'
import type { RunToolContext } from '@/types'

export async function runTool({
    loader,
    toolType,
    version,
    args,
    paths,
}: RunToolContext): Promise<void> {
    const toolName = loader.name
    const logTag = `[${toolType.toUpperCase()}]`
    const { runner } = await loader()
    const startTime = performance.now()

    await runner(version, args, paths)

    const endTime = performance.now()
    const durationMs = Math.round(endTime - startTime)

    info(`${logTag} ✔ ${toolName} (${durationMs.toString()}ms)`)
}
