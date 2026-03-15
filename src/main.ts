import { availableParallelism } from 'node:os'
import micromatch from 'micromatch'
import pLimit from 'p-limit'
import { setFailed } from '@actions/core'
import { runTool } from '@/tool'
import { commitlint } from '@/linters/commitlint'
import { resolveConfig } from '@/config'
import { getExecErrors } from '@/store'
import { renderErrorSummary } from '@/render'
import { actionContext, getChangedFilePaths } from '@/github'
import { formatter, linter, formatterKeys, linterKeys } from '@/map'

const { isTitleCheckEnabled, pullRequestTitle, eventName } = actionContext
const limit = pLimit(availableParallelism())

run()
    .then(async () => {
        const execErrors = getExecErrors()

        if (execErrors.length !== 0) {
            await renderErrorSummary(execErrors)

            setFailed('[INSIGHT] Detected linting errors')
        }
    })
    .catch((error: unknown) => {
        if (error instanceof Error) {
            setFailed(error.message)
        } else if (typeof error === 'string') {
            setFailed(error)
        } else {
            setFailed('Unknown error')
        }
    })

async function run(): Promise<void> {
    if (isTitleCheckEnabled) {
        await commitlint(pullRequestTitle)

        return
    }

    const { match, schedule, formatters, linters, args, versions } = await resolveConfig()

    if (eventName === 'schedule') {
        await limit.map(schedule.linters, async (toolName) => {
            await runTool({
                loader: linter[toolName],
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
                loader: formatter[toolName],
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
                loader: linter[toolName],
                toolType: 'linter',
                version: versions[toolName],
                args: args.linters[toolName],
                paths,
            })
        }),
    ])
}
