import { getOctokit } from '@actions/github'
import { getInput, getBooleanInput, info, group } from '@actions/core'
import { unorderedList } from '@/utils'
import type { ActionContext } from '@/types'

export const actionContext = {
    configPath: getInput('config-path'),
    isTitleCheckEnabled: getBooleanInput('check-pull-request-title'),
    pullRequestTitle: getInput('pull-request-title'),
    eventName: getInput('event-name'),
    token: getInput('token'),
    repository: getInput('repository'),
    pullRequestNumber: parseInt(getInput('pull-request-number')),
} as const satisfies ActionContext

const { token, repository, pullRequestNumber } = actionContext
const [owner, repo] = repository.split('/', 2)
const octokit = getOctokit(token)

export async function getChangedFilePaths(): Promise<string[]> {
    return await group(`[PR] Changed file paths`, async () => {
        const changedFiles = await octokit.paginate(
            // NOTE: Responses include a maximum of 3000 files.
            // The paginated response returns 30 files per page by default.
            // https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/pulls/listFiles.md
            octokit.rest.pulls.listFiles,
            {
                owner,
                repo,
                /* eslint-disable @typescript-eslint/naming-convention */
                pull_number: pullRequestNumber,
                per_page: 100, // max
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        )
        // TODO: The filtering logic isn't perfect.
        const changedFilePaths = changedFiles
            .filter(({ status }) => status === 'added' || status === 'modified')
            .map(({ filename }) => filename)

        info(
            `[TOTAL] Found ${changedFilePaths.length.toString()} changed files:\n${unorderedList(changedFilePaths)}`,
        )

        return changedFilePaths
    })
}
