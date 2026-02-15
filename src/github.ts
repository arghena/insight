import { getOctokit } from '@actions/github'
import { getInput, info, group } from '@actions/core'
import { unorderedList } from '@/utils'

interface Inputs {
    configPath: string
    checkPullRequestTitle: string
    sha: string
    pullRequestTitle: string
    eventName: string
    refType: string
    token: string
    repository: string
    pullRequestNumber: string
}

export function getInputs(): Inputs {
    const configPath = getInput('config-path', { required: false })
    const checkPullRequestTitle = getInput('check-pull-request-title', { required: false })
    const sha = getInput('sha', { required: false })
    const pullRequestTitle = getInput('pull-request-title', {
        required: false,
    })
    const eventName = getInput('event-name', { required: false })
    const refType = getInput('ref-type', { required: false })
    const token = getInput('token', { required: false })
    const repository = getInput('repository', { required: false })
    const pullRequestNumber = getInput('pull-request-number', {
        required: false,
    })

    return {
        configPath,
        checkPullRequestTitle,
        sha,
        pullRequestTitle,
        eventName,
        refType,
        token,
        repository,
        pullRequestNumber,
    }
}

export async function getChangedFilePaths(
    token: string,
    repository: string,
    pullRequestNumber: string,
): Promise<string[]> {
    return await group(`[PR] Changed file paths`, async () => {
        const octokit = getOctokit(token)
        const [owner, repo] = repository.split('/', 2)
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

export async function getFileContent(
    path: string,
    token: string,
    repository: string,
    sha?: string,
): Promise<string> {
    const octokit = getOctokit(token)
    const [owner, repo] = repository.split('/', 2)
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
