import { getOctokit } from '@actions/github'
import { getInput, info, group } from '@actions/core'
import { unorderedList } from '@/utils'

export const actionContext = {
    configPath: getInput('config-path', { required: false }),
    checkPullRequestTitle: getInput('check-pull-request-title', { required: false }),
    sha: getInput('sha', { required: false }),
    pullRequestTitle: getInput('pull-request-title', {
        required: false,
    }),
    eventName: getInput('event-name', { required: false }),
    refType: getInput('ref-type', { required: false }),
    token: getInput('token', { required: false }),
    repository: getInput('repository', { required: false }),
    pullRequestNumber: getInput('pull-request-number', {
        required: false,
    }),
}

const { token, repository, pullRequestNumber, sha } = actionContext
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
                pull_number: parseInt(pullRequestNumber),
                per_page: 100, // max
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        )
        // TODO: The filtering logic isn't perfect.
        const changedFilePaths = changedFiles
            .filter((file) => file.status === 'added' || file.status === 'modified')
            .map((file) => file.filename)

        info(
            `[TOTAL] Found ${changedFilePaths.length.toString()} changed files:\n${unorderedList(changedFilePaths)}`,
        )

        return changedFilePaths
    })
}

export async function getFileContent(path: string): Promise<string> {
    const { data } = await octokit.rest.repos.getContent({
        mediaType: {
            format: 'raw',
        },
        owner,
        repo,
        path,
        ref: sha,
    })

    if (typeof data !== 'string') throw new Error(`[API] Error fetching remote file at ${path}`)

    return data
}
