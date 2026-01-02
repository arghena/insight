import { getInputs, getChangedFilePaths } from './github'
import { resolveConfig } from './config'
import { formatter, linter, type FormatterKey, type LinterKey } from './map'
import { installer } from './installer'
import micromatch from 'micromatch'
import { info, setFailed, setOutput, group } from '@actions/core'
import { exec } from '@actions/exec'
import fg from 'fast-glob'
import { resolveGitignore } from './config'
import { toBulletedList } from './utils'

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
    const { match, pr, schedule, push, args, formatters, linters, versions } = await resolveConfig(configPath)

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
        for (const name of schedule.tasks) {
            await group(`[LINTER] ${name}`, async () => {
                const { runner } = await linter[name]()

                info(`[SCHEDULE] Starting ${name} cron job`)

                await runner([], name, versions[name], args.linters[name])
            })
        }

        return
    }

    if (refType === 'tag') {
        const ig = await resolveGitignore()

        for (const name of push.formatters) {
            const paths = await fg(formatters[name], { dot: match.dot })

            if (paths.length === 0) continue

            await group(`[FORMATTER] ${name}`, async () => {
                const { runner } = await formatter[name]()

                info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

                await runner(paths, name, versions[name], args.formatters[name])
            })
        }

        for (const name of push.linters) {
            // NOTE:
            // May match unexpected files.
            // ex: Clippy creates a `target` folder before it runs.
            const matchedPaths = await fg(linters[name], { dot: match.dot })
            const paths = ig.filter(matchedPaths)

            if (paths.length === 0) continue

            await group(`[LINTER] ${name}`, async () => {
                const { runner } = await linter[name]()

                info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

                await runner(paths, name, versions[name], args.linters[name])
            })
        }

        return
    }

    const formatterKeys = Object.keys(formatter) as FormatterKey[]
    const linterKeys = Object.keys(linter) as LinterKey[]
    const changedFilePaths = await getChangedFilePaths(token, repository, pullRequestNumber)

    for (const name of formatterKeys) {
        const paths = micromatch(changedFilePaths, formatters[name], {
            dot: match.dot,
        })

        if (paths.length === 0) continue

        await group(`[FORMATTER] ${name}`, async () => {
            const { runner } = await formatter[name]()

            info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

            await runner(paths, name, versions[name], args.formatters[name])
        })
    }
    for (const name of linterKeys) {
        const paths = micromatch(changedFilePaths, linters[name], {
            dot: match.dot,
        })

        if (paths.length === 0) continue

        await group(`[LINTER] ${name}`, async () => {
            const { runner } = await linter[name]()

            info(`[GLOB] Matched file paths:\n${toBulletedList(paths)}`)

            await runner(paths, name, versions[name], args.linters[name])
        })
    }

    const hasAnyChanged = Object.entries(pr['detect-changes']).reduce(
        (acc, [category, patterns]) => {
            const matchedPaths = micromatch(changedFilePaths, patterns, {
                dot: match.dot,
            })
            const hasChanged = matchedPaths.length > 0

            setOutput(`${category}-any-changed`, hasChanged)

            return acc || hasChanged
        },
        false,
    )

    setOutput('any-changed', hasAnyChanged)
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
