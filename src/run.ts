import { styleText, type StyleTextOptions } from 'node:util'
import { performance } from 'node:perf_hooks'
import micromatch from 'micromatch'
import pLimit from 'p-limit'
import { info } from '@actions/core'
import { concurrency } from '@/constants'
import { commitlint } from '@/linters/commitlint'
import { resolveConfig } from '@/config'
import { actionContext, getChangedFilePaths } from '@/github'
import { formatterRegistry, linterRegistry, formatterKeys, linterKeys } from '@/registries'
import type { SetupToolContext, RunToolContext } from '@/types'

const { isTitleCheckEnabled, pullRequestTitle, eventName } = actionContext
const limit = pLimit(concurrency)
const styleTextOptions = { validateStream: false } as const satisfies StyleTextOptions
const successIcon = styleText('green', '✔', styleTextOptions)
const failureIcon = styleText('red', '✖', styleTextOptions)

export async function run(): Promise<void> {
    if (isTitleCheckEnabled) {
        await commitlint(pullRequestTitle)

        return
    }

    const { match, schedule, formatters, linters, args, versions } = await resolveConfig()
    const tasks: RunToolContext[] = []

    if (eventName === 'schedule') {
        for (const toolName of schedule.linters) {
            tasks.push({
                loader: linterRegistry[toolName],
                toolType: 'linter',
                version: versions[toolName],
                args: args.linters[toolName],
                paths: [],
            })
        }
    } else if (eventName === 'pull_request') {
        const changedFilePaths = await getChangedFilePaths()

        for (const toolName of formatterKeys) {
            const paths = micromatch(changedFilePaths, formatters[toolName], { dot: match.dot })

            if (paths.length > 0) {
                tasks.push({
                    loader: formatterRegistry[toolName],
                    toolType: 'formatter',
                    version: versions[toolName],
                    args: args.formatters[toolName],
                    paths,
                })
            }
        }

        for (const toolName of linterKeys) {
            const paths = micromatch(changedFilePaths, linters[toolName], { dot: match.dot })

            if (paths.length > 0) {
                tasks.push({
                    loader: linterRegistry[toolName],
                    toolType: 'linter',
                    version: versions[toolName],
                    args: args.linters[toolName],
                    paths,
                })
            }
        }
    } else {
        throw new Error(`[EVENT] Invalid ${eventName} event`)
    }

    // eslint-disable-next-line @typescript-eslint/promise-function-async
    await limit.map(tasks, ({ loader, version }) => setupTool({ loader, version }))
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    await limit.map(tasks, (task) => runTool(task))
}

async function setupTool({ loader, version }: SetupToolContext): Promise<void> {
    const { setup } = await loader()

    await setup({ version })
}

async function runTool({ loader, toolType, version, args, paths }: RunToolContext): Promise<void> {
    const toolName = loader.name
    const logTag = `[${toolType.toUpperCase()}]`
    const { runner } = await loader()
    const startTime = performance.now()

    const exitCode = await runner({ version, args, paths })

    const endTime = performance.now()
    const durationMs = Math.round(endTime - startTime)
    const formattedDuration = styleText('gray', `(${durationMs.toString()}ms)`, styleTextOptions)

    info(`${logTag} ${exitCode === 0 ? successIcon : failureIcon} ${toolName} ${formattedDuration}`)
}
