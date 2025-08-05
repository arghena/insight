import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type SchedulerKey } from '../map'

export async function runner(
    name: SchedulerKey,
    version: string,
    options: string[],
): Promise<void> {
    await installer(name, version)

    info(`[runner] Running ${name} cron job`)

    await exec(name.replace('_', '-'), ['check', ...options])
}
