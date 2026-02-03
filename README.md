<!-- markdownlint-disable MD033 MD041 -->
<!--

NOTE: This file will be bundled into the final product (`*.tar.gz`) when it is released,
so URLs should be used consistently within the file to point to project files, rather than local paths.
This is because users won't have access to those files locally when browsing the file.

-->

<div align="center">
  <h1>Insight</h1>
  <p>A GitHub Action for checking pull requests.</p>

<a href="https://github.com/arghena/insight/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/arghena/insight/ci.yml?branch=v0.1.0-canary.29&style=for-the-badge&label=CI&labelColor=1a1b26&color=black&logo=github" alt="CI" /></a>
<a href="https://github.com/arghena/insight/actions/workflows/cd.yml"><img src="https://img.shields.io/github/actions/workflow/status/arghena/insight/cd.yml?branch=v0.1.0-canary.29&style=for-the-badge&label=CD&labelColor=1a1b26&color=black&logo=github" alt="CD" /></a>

</div>

<!-- markdownlint-enable MD033 -->

## Features

- Use the `insight.toml` config file to customize the formatters and linters your project needs.
- Supports using [commitlint](https://commitlint.js.org) to check the pull request title.
- Responds to [`on.schedule`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule) and [`on.push.tags`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore) events, respecting `.gitignore` when running linters.
- Can check build files in `dist/` using a `git diff` approach.
- Lets you customize formatter and linter versions and arguments.
- Supports [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) patterns to match exactly the files you want to check.
- Supports detecting file changes and outputs the result.
- Ships with minimal defaults to keep opinionated behavior to a minimum.

## Usage

> [!IMPORTANT]
>
> - If you set `check-pull-request-title` to `true`, then Insight will only check the pull request title.
> - Insight only checks `added` and `modified` files.

```yaml
jobs:
  insight:
    name: Insight
    runs-on: ubuntu-latest
    outputs:
      any-changed: ${{ steps.insight.outputs.any-changed }}
      rust-any-changed: ${{ steps.insight.outputs.rust-any-changed }}
      actions-any-changed: ${{ steps.insight.outputs.actions-any-changed }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v6
      - name: Run Insight
        id: insight
        uses: arghena/insight@v0.1.0-canary.29
        with:
          # The path to the Insight config file.
          # Default: '.github/insight.toml'
          config-path: ''
          # The name of the event that triggered the workflow run.
          # Default: ${{ github.event_name }}
          event-name: ''
          # The type of ref that triggered the workflow run.
          # Default: ${{ github.ref_type }}
          ref-type: ''
          # Use `commitlint` to check the pull request title.
          # Default: 'false'
          check-pull-request-title: ''
          # The title of pull request event.
          # Default: ${{ github.event.pull_request.title }}
          pull-request-title: ''
          # Personal access token (PAT) used to fetch the repository.
          # Default: ${{ github.token }}
          token: ''
          # Repository name with owner.
          # Default: ${{ github.repository }}
          repository: ''
          # The number of the pull request to check.
          # Default: ${{ github.event.pull_request.number }}
          pull-request-number: ''

  test:
    name: Test
    needs: insight
    if: ${{ needs.insight.outputs.any-changed == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - name: Run test
        run: echo test
```

## Configure Insight

> [!NOTE]
> You can refer to our [examples](https://github.com/arghena/insight/tree/canary/examples).

```toml
[match]
# Match dotfiles.
# Default: false
dot = true

[changes]
# Detect file changes.
# Default: []
rust = ["**/*.rs"]
actions = [".github/workflows/*.yml"]

[schedule]
# Linters to run on `on.schedule` events.
# Default: []
linters = ["cargo-deny"]

[push]
# Formatters to run on `on.push.tags` events.
# Default: []
formatters = ["prettier"]
# Linters to run on `on.push.tags` events.
# Default: []
linters = ["check-dist", "eslint"]

[args.formatters]
# Arguments passed to formatters.
# Default: []
shfmt = ["-i", "4", "-ci"]

[args.linters]
# Arguments passed to linters.
# Default: []
check-dist = ["prepare"]
yamllint = ["--strict"]

[formatters]
# Glob patterns for files that trigger formatters.
# Default: []
prettier = ["**/*.yml", "**/*.ts", "**/*.md", "**/*.json"]
shfmt = ["etc/ci/*.sh"]

[linters]
# Glob patterns for files that trigger linters.
# Default: []
check-dist = ["src/**/*.ts", "package.json", "pnpm-lock.yaml"]
cargo-deny = ["Cargo.toml", "Cargo.lock"]
typos = ["**/*", "!dist/**"]
yamllint = ["**/*.yml"]
eslint = ["**/*.ts"]

[versions]
# Lock formatter/linter versions.
# Default: "latest"
commitlint = "19.8.1"
prettier = "3.6.2"
eslint = "9.33.0"
```

## Available Formatters

| Tool                                             | Formatter name |
| ------------------------------------------------ | -------------- |
| [prettier](https://github.com/prettier/prettier) | `prettier`     |
| [rustfmt](https://github.com/rust-lang/rustfmt)  | `cargo-fmt`    |
| [shfmt](https://github.com/mvdan/sh)             | `shfmt`        |
| [taplo](https://github.com/tamasfe/taplo)        | `taplo`        |
| [tombi](https://github.com/tombi-toml/tombi)     | `tombi`        |

## Available Linters

| Tool                                                                                   | Linter name         | Supports scheduling |
| -------------------------------------------------------------------------------------- | ------------------- | :-----------------: |
| [cargo-deny](https://github.com/EmbarkStudios/cargo-deny)                              | `cargo-deny`        |         ✅          |
| [node-audit](https://github.com/arghena/insight/blob/canary/src/linters/node-audit.ts) | `node-audit`        |         ✅          |
| [check-dist](https://github.com/arghena/insight/blob/canary/src/linters/check-dist.ts) | `check-dist`        |                     |
| [eslint](https://github.com/eslint/eslint)                                             | `eslint`            |                     |
| [typos](https://github.com/crate-ci/typos)                                             | `typos`             |                     |
| [yamllint](https://github.com/adrienverge/yamllint)                                    | `yamllint`          |                     |
| [actionlint](https://github.com/rhysd/actionlint)                                      | `actionlint`        |                     |
| [ast-grep](https://github.com/ast-grep/ast-grep)                                       | `ast-grep`          |                     |
| [clippy](https://github.com/rust-lang/rust-clippy)                                     | `cargo-clippy`      |                     |
| [cargo-msrv](https://github.com/foresterre/cargo-msrv)                                 | `cargo-msrv`        |                     |
| [cargo-tarpaulin](https://github.com/xd009642/tarpaulin)                               | `cargo-tarpaulin`   |                     |
| [alex](https://github.com/get-alex/alex)                                               | `alex`              |                     |
| [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)                   | `markdownlint-cli2` |                     |
| [vale](https://github.com/errata-ai/vale)                                              | `vale`              |                     |
| [shellcheck](https://github.com/koalaman/shellcheck)                                   | `shellcheck`        |                     |
| [taplo](https://github.com/tamasfe/taplo)                                              | `taplo`             |                     |
| [tombi](https://github.com/tombi-toml/tombi)                                           | `tombi`             |                     |
| [tsc](https://github.com/microsoft/TypeScript)                                         | `tsc`               |                     |

## Contributing

Please refer to our [CONTRIBUTING.md](https://github.com/arghena/insight/blob/canary/.github/CONTRIBUTING.md).

## Security

> [!NOTE]
> If you believe you have found a security vulnerability in Insight, we encourage you to **responsibly disclose this and NOT open a public issue**.

Please refer to our [SECURITY.md](https://github.com/arghena/insight/blob/canary/.github/SECURITY.md).

## Releases

The version naming of Insight follows [Semantic Versioning 2.0.0](https://semver.org/#semantic-versioning-200).

### Long-term Support

> [!NOTE]
> When Insight releases a new major version, the previous stable version will be designated as an LTS version.

The LTS version of Insight provides security updates and bug fixes for six months.

### Release Table

| Insight | Node.js | Codename | Released at | End of Life |
| ------- | ------- | -------- | ----------- | ----------- |
| v0.1.0  | v24     | Galileo  | -           | -           |

## License

Insight is distributed under the [MIT License](https://github.com/arghena/insight/blob/canary/LICENSE).
