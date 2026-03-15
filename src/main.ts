import { setFailed } from '@actions/core'
import { run } from '@/run'
import { getExecErrors } from '@/store'
import { renderErrorSummary } from '@/render'

run()
    .then(async () => {
        const execErrors = getExecErrors()

        if (execErrors.length !== 0) {
            await renderErrorSummary(execErrors)

            setFailed('[INSIGHT] Detected linting errors')
        }
    })
    .catch((error: unknown) => {
        if (error instanceof Error) {
            setFailed(error.message)
        } else if (typeof error === 'string') {
            setFailed(error)
        } else {
            setFailed('Unknown error')
        }
    })
