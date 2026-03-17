import { availableParallelism } from 'node:os'

export const concurrency = availableParallelism() * 2
