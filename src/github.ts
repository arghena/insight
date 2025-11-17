import { getInput, info } from '@actions/core'
import { getOctokit } from '@actions/github'

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

export async function getChangedFiles(
    token: string,
    repository: string,
    pull_request_number: string,
): Promise<string[]> {
    const octokit = getOctokit(token)
    const repository_parts = repository.split('/', 2)
    const { data: pullRequest } = await octokit.rest.pulls.listFiles({
        owner: repository_parts[0],
        repo: repository_parts[1],
        pull_number: parseInt(pull_request_number),
    })
    const changed_files = pullRequest
        .filter((file) => file.status === 'added' || file.status === 'modified')
        .map((file) => file.filename)

    info(`[github] Got these files from the #${pull_request_number}: ${changed_files}`)

    return changed_files
}
