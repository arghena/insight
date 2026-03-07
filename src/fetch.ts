import { URL } from 'node:url'
import { HttpClient } from '@actions/http-client'

const client = new HttpClient('arghena/insight')

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

export function isValidHttpsUrl(str: string): str is `https://${string}` {
    if (!URL.canParse(str)) return false

    const url = new URL(str)

    return url.protocol === 'https:'
}
