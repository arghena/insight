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

    info(`${logTag} Kicking off ${toolName} (version ${version})`)

    await runner(version, args, paths)

    info(`${logTag} Wrapped up ${toolName} successfully`)
}
