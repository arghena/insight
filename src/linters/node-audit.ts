import { installer } from '../installer'
import { exec } from '@actions/exec'
import { info } from '@actions/core'
import { type LinterKey } from '../map'

export async function runner(
    paths: string[],
    name: LinterKey,
    version: string,
    args: string[],
): Promise<void> {
    const count = paths.length

    await installer(name, version)

    info(
        count === 0
            ? `[RUNNER] Running ${name} cron job`
            : `[RUNNER] Running ${name} on ${count.toString()} files`,
    )

    await exec('na', ['audit', ...args], {
        // https://github.com/antfu-collective/ni/blob/82611c44aeada5185d5fb5fc2c72c2ce6b921159/src/detect.ts#L39-L53
        env: {
            ...process.env,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            NI_AUTO_INSTALL: 'true',
        },
    })
}
