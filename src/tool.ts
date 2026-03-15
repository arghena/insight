import { performance } from 'node:perf_hooks'
import { styleText } from 'node:util'
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
    const successIcon = styleText('green', '✔', { validateStream: false })
    const failureIcon = styleText('red', '✖', { validateStream: false })
    const { runner } = await loader()
    const startTime = performance.now()

    const exitCode = await runner(version, args, paths)

    const endTime = performance.now()
    const durationMs = Math.round(endTime - startTime)
    const formattedDuration = styleText('gray', `(${durationMs.toString()}ms)`, {
        validateStream: false,
    })

    info(`${logTag} ${exitCode === 0 ? successIcon : failureIcon} ${toolName} ${formattedDuration}`)
}
