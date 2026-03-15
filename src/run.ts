import { styleText } from 'node:util'
import { performance } from 'node:perf_hooks'
import { availableParallelism } from 'node:os'
import micromatch from 'micromatch'
import pLimit from 'p-limit'
import { info } from '@actions/core'
import { commitlint } from '@/linters/commitlint'
import { resolveConfig } from '@/config'
import { actionContext, getChangedFilePaths } from '@/github'
import { formatterRegistry, linterRegistry, formatterKeys, linterKeys } from '@/registries'
import type { RunToolContext } from '@/types'

const { isTitleCheckEnabled, pullRequestTitle, eventName } = actionContext
const limit = pLimit(availableParallelism() * 2)

export async function run(): Promise<void> {
    if (isTitleCheckEnabled) {
        await commitlint(pullRequestTitle)

        return
    }

    const { match, schedule, formatters, linters, args, versions } = await resolveConfig()

    if (eventName === 'schedule') {
        await limit.map(schedule.linters, async (toolName) => {
            await runTool({
                loader: linterRegistry[toolName],
                toolType: 'linter',
                version: versions[toolName],
                args: args.linters[toolName],
                paths: [],
            })
        })

        return
    }

    if (eventName !== 'pull_request') {
        throw new Error(`[EVENT] Invalid ${eventName} event`)
    }

    const changedFilePaths = await getChangedFilePaths()

    await Promise.all([
        limit.map(formatterKeys, async (toolName) => {
            const paths = micromatch(changedFilePaths, formatters[toolName], { dot: match.dot })

            if (paths.length === 0) {
                return
            }

            await runTool({
                loader: formatterRegistry[toolName],
                toolType: 'formatter',
                version: versions[toolName],
                args: args.formatters[toolName],
                paths,
            })
        }),
        limit.map(linterKeys, async (toolName) => {
            const paths = micromatch(changedFilePaths, linters[toolName], { dot: match.dot })

            if (paths.length === 0) {
                return
            }

            await runTool({
                loader: linterRegistry[toolName],
                toolType: 'linter',
                version: versions[toolName],
                args: args.linters[toolName],
                paths,
            })
        }),
    ])
}

async function runTool({ loader, toolType, version, args, paths }: RunToolContext): Promise<void> {
    const toolName = loader.name
    const logTag = `[${toolType.toUpperCase()}]`
    const successIcon = styleText('green', '✔', { validateStream: false })
    const failureIcon = styleText('red', '✖', { validateStream: false })
    const { runner } = await loader()
    const startTime = performance.now()

    const exitCode = await runner({ version, args, paths })

    const endTime = performance.now()
    const durationMs = Math.round(endTime - startTime)
    const formattedDuration = styleText('gray', `(${durationMs.toString()}ms)`, {
        validateStream: false,
    })

    info(`${logTag} ${exitCode === 0 ? successIcon : failureIcon} ${toolName} ${formattedDuration}`)
}
