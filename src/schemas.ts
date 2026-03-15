// NOTE: Enables tree-shaking.
// https://github.com/colinhacks/zod/pull/4569
import * as z from 'zod'
import { formatterKeys, linterKeys } from '@/registries'

const formatterKeySchema = z.enum(formatterKeys)
const linterKeySchema = z.enum(linterKeys)
const scheduledLinterSchema = z.enum(['cargo-deny', 'node-audit'])

export const configSchema = z.object({
    match: z.object({
        dot: z.boolean(),
    }),
    schedule: z.object({
        linters: z.array(scheduledLinterSchema),
    }),
    formatters: z.record(formatterKeySchema, z.array(z.string())),
    linters: z.record(linterKeySchema, z.array(z.string())),
    args: z.object({
        formatters: z.record(formatterKeySchema, z.array(z.string())),
        linters: z.record(linterKeySchema, z.array(z.string())),
    }),
    versions: z.record(z.union([formatterKeySchema, linterKeySchema]), z.string()),
})

export type Config = z.infer<typeof configSchema>
