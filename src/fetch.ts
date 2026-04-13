import { HttpClient } from '@actions/http-client'

const client = new HttpClient('arghena/insight', [], { allowRetries: true, maxRetries: 3 })

export async function fetchText(url: `https://${string}`): Promise<string> {
    const res = await client.get(url)
    const { statusCode } = res.message

    if (statusCode !== 200) {
        throw new Error(
            `[REQUEST] Unexpected ${String(statusCode ?? 'unknown')} when accessing ${url}`,
        )
    }

    return await res.readBody()
}
