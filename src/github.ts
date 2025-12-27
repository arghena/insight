import { getInput, info, group } from '@actions/core'
import { getOctokit } from '@actions/github'
import { toBulletedList } from './utils'

interface Inputs {
    config_path: string
    event_name: string
    ref_type: string
    pull_request_type: string
    pull_request_title: string
    token: string
    repository: string
    pull_request_number: string
}

export function getInputs(): Inputs {
    const config_path = getInput('config-path', { required: false })
    const event_name = getInput('event-name', { required: false })
    const ref_type = getInput('ref-type', { required: false })
    const pull_request_type = getInput('pull-request-type', { required: false })
    const pull_request_title = getInput('pull-request-title', {
        required: false,
    })
    const token = getInput('token', { required: false })
    const repository = getInput('repository', { required: false })
    const pull_request_number = getInput('pull-request-number', {
        required: false,
    })

    return {
        config_path,
        event_name,
        ref_type,
        pull_request_type,
        pull_request_title,
        token,
        repository,
        pull_request_number,
    }
}

export async function getChangedFilePaths(
    token: string,
    repository: string,
    pull_request_number: string,
): Promise<string[]> {
    return await group(`[PR] Changed file paths`, async () => {
        const octokit = getOctokit(token)
        const [owner, repo] = repository.split('/', 2)
        const changed_files = await octokit.paginate(
            // NOTE:
            // Responses include a maximum of 3000 files.
            // The paginated response returns 30 files per page by default.
            // https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/pulls/listFiles.md
            octokit.rest.pulls.listFiles,
            {
                owner,
                repo,
                pull_number: parseInt(pull_request_number),
                per_page: 100, // max
            },
        )
        const changed_file_paths = changed_files
            .filter((file) => file.status === 'added' || file.status === 'modified')
            .map((file) => file.filename)

        info(
            `[TOTAL] Found ${changed_file_paths.length} changed files:\n${toBulletedList(changed_file_paths)}`,
        )

        return changed_file_paths
    })
}
