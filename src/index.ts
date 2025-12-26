import { getInputs, getChangedFiles } from './github'
import { resolveConfig } from './config'
import { formatter, linter, type FormatterKey, type LinterKey } from './map'
import { installer } from './installer'
import micromatch from 'micromatch'
import { info, setFailed, setOutput, group } from '@actions/core'
import { exec } from '@actions/exec'
import fg from 'fast-glob'
import { resolveGitignore } from './config'

async function run() {
    const {
        config_path,
        event_name,
        ref_type,
        pull_request_type,
        pull_request_title,
        token,
        repository,
        pull_request_number,
    } = getInputs()
    // prettier-ignore
    const { match, pull_request, schedule, push_tag, args, formatters, linters, versions } = await resolveConfig(config_path)
    const ig = await resolveGitignore()
    const formatter_keys = Object.keys(formatter) as FormatterKey[]
    const linter_keys = Object.keys(linter) as LinterKey[]

    if (event_name === 'schedule') {
        for (const name of schedule.tasks) {
            await group(`[LINTER] ${name}`, async () => {
                const { runner } = await linter[name]()

                info(`[SCHEDULE] Starting ${name} cron job`)

                await runner([], name, versions[name], args.linters[name])
            })
        }

        return
    }

    if (ref_type === 'tag') {
        for (const name of push_tag.formatters) {
            const paths = await fg(formatters[name], { dot: match.dot })

            if (paths.length === 0) continue

            await group(`[FORMATTER] ${name}`, async () => {
                const { runner } = await formatter[name]()

                info(`[GLOB] Matched file paths: ${paths}`)

                await runner(paths, name, versions[name], args.formatters[name])
            })
        }

        for (const name of push_tag.linters) {
            // NOTE:
            // May match unexpected files.
            // ex: Clippy creates a `target` folder before it runs.
            const matched_paths = await fg(linters[name], { dot: match.dot })
            const paths = ig.filter(matched_paths)

            if (paths.length === 0) continue

            await group(`[LINTER] ${name}`, async () => {
                const { runner } = await linter[name]()

                info(`[GLOB] Matched file paths: ${paths}`)

                await runner(paths, name, versions[name], args.linters[name])
            })
        }

        return
    }

    if (
        pull_request.check_title &&
        (pull_request_type === 'opened' || pull_request_type === 'edited')
    ) {
        await group(`[LINTER] commitlint`, async () => {
            info(`[PR] Found title: ${pull_request_title}`)

            await installer(
                'commitlint_config_conventional',
                versions['commitlint_config_conventional'],
            )
            await installer('commitlint', versions['commitlint'])

            info(`[RUNNER] Checking the pull request title`)

            await exec('commitlint', args.linters['commitlint'], {
                input: Buffer.from(pull_request_title + '\n'),
            })
        })
    }

    const changed_files = await getChangedFiles(token, repository, pull_request_number)

    for (const name of formatter_keys) {
        const paths = micromatch(changed_files, formatters[name], {
            dot: match.dot,
        })

        if (paths.length === 0) continue

        await group(`[FORMATTER] ${name}`, async () => {
            const { runner } = await formatter[name]()

            info(`[GLOB] Matched file paths: ${paths}`)

            await runner(paths, name, versions[name], args.formatters[name])
        })
    }
    for (const name of linter_keys) {
        const paths = micromatch(changed_files, linters[name], {
            dot: match.dot,
        })

        if (paths.length === 0) continue

        await group(`[LINTER] ${name}`, async () => {
            const { runner } = await linter[name]()

            info(`[GLOB] Matched file paths: ${paths}`)

            await runner(paths, name, versions[name], args.linters[name])
        })
    }

    const paths = micromatch(changed_files, pull_request.detect_changes, {
        dot: match.dot,
    })

    if (paths.length !== 0) setOutput('any-changed', 'true')
}

run().catch((error) => {
    if (error instanceof Error) {
        setFailed(error.message)
    } else if (typeof error === 'string') {
        setFailed(error)
    } else {
        setFailed('Unknown error')
    }
})
