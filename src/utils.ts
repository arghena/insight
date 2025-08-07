import { access, constants } from 'fs/promises'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type FormatterKey, type LinterKey } from './map'

export async function fileExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK)

        return true
    } catch {
        return false
    }
}

export async function getGoCliPath(
    name: FormatterKey | LinterKey,
): Promise<string> {
    let go_path = ''

    info(`[env] Getting GOPATH`)

    await exec('go', ['env', 'GOPATH'], {
        listeners: {
            stdout: (data: Buffer) => (go_path += data.toString()),
        },
    })

    return `${go_path}/bin/${name}`
}
