import fg from 'fast-glob'
import micromatch from 'micromatch'
import { exec } from '@actions/exec'
import { info, setFailed, group } from '@actions/core'
import { installer } from '@/installer'
import { toBulletedList } from '@/utils'
import { getInputs, getChangedFilePaths } from '@/github'
import { resolveConfig, resolveGitignore } from '@/config'
import { formatter, linter, type FormatterKey, type LinterKey } from '@/map'

async function run() {
    const {
        configPath,
        eventName,
        refType,
        checkPullRequestTitle,
        pullRequestTitle,
        token,
        repository,
        pullRequestNumber,
    } = getInputs()
    // prettier-ignore
    const {
        match,
        schedule,
        push,
        args,
        formatters,
        linters,
        versions,
    } = await resolveConfig(configPath)

    if (checkPullRequestTitle === 'true') {
        await group(`[LINTER] commitlint`, async () => {
            info(`[PR] Found title:\n${pullRequestTitle}`)

            await installer(
                'commitlint-config-conventional',
                versions['commitlint-config-conventional'],
            )
            await installer('commitlint', versions.commitlint)

            info(`[RUNNER] Checking the pull request title`)

            await exec('commitlint', args.linters.commitlint, {
                input: Buffer.from(pullRequestTitle + '\n'),
            })
        })

        return
    }

    if (eventName === 'schedule') {
        for (const toolName of schedule.linters) {
            await group(`[LINTER] ${toolName}`, async () => {
                const { runner } = await linter[toolName]()

                info(`[SCHEDULE] Starting ${toolName} cron job`)

                await runner([], toolName, versions[toolName], args.linters[toolName])
            })
        }

        return
    }

    if (refType === 'tag') {
        const ig = await resolveGitignore()

        for (const toolName of push.formatters) {
            const paths = await fg(formatters[toolName], { dot: match.dot })

            if (paths.length === 0) continue

            await group(`[FORMATTER] ${toolName}`, async () => {
                const { runner } = await formatter[toolName]()

                info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

                await runner(paths, toolName, versions[toolName], args.formatters[toolName])
            })
        }

        for (const toolName of push.linters) {
            // NOTE: May match unexpected files.
            // For example, Clippy creates a `target` folder before it runs.
            const matchedPaths = await fg(linters[toolName], { dot: match.dot })
            const paths = ig.filter(matchedPaths)

            if (paths.length === 0) continue

            await group(`[LINTER] ${toolName}`, async () => {
                const { runner } = await linter[toolName]()

                info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

                await runner(paths, toolName, versions[toolName], args.linters[toolName])
            })
        }

        return
    }

    const formatterKeys = Object.keys(formatter) as FormatterKey[]
    const linterKeys = Object.keys(linter) as LinterKey[]
    const changedFilePaths = await getChangedFilePaths(token, repository, pullRequestNumber)

    for (const toolName of formatterKeys) {
        const paths = micromatch(changedFilePaths, formatters[toolName], {
            dot: match.dot,
        })

        if (paths.length === 0) continue

        await group(`[FORMATTER] ${toolName}`, async () => {
            const { runner } = await formatter[toolName]()

            info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

            await runner(paths, toolName, versions[toolName], args.formatters[toolName])
        })
    }

    for (const toolName of linterKeys) {
        const paths = micromatch(changedFilePaths, linters[toolName], {
            dot: match.dot,
        })

        if (paths.length === 0) continue

        await group(`[LINTER] ${toolName}`, async () => {
            const { runner } = await linter[toolName]()

            info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

            await runner(paths, toolName, versions[toolName], args.linters[toolName])
        })
    }
}

run().catch((error: unknown) => {
    if (error instanceof Error) {
        setFailed(error.message)
    } else if (typeof error === 'string') {
        setFailed(error)
    } else {
        setFailed('Unknown error')
    }
})
