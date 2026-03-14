<!-- markdownlint-disable MD033 MD041 -->
<!--

NOTE: This file will be bundled into the final product (`*.tar.gz`) when it is released,
so URLs should be used consistently within the file to point to project files, rather than local paths.
This is because users won't have access to those files locally when browsing the file.

-->

<div align="center">
  <h1>Insight</h1>
  <p>A GitHub Action for checking pull requests.</p>

<a href="https://github.com/arghena/insight/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/arghena/insight/ci.yml?branch=canary&style=for-the-badge&logo=github&label=ci&labelColor=1a1b26" alt="CI" /></a>
<a href="https://github.com/arghena/insight/releases/latest"><img src="https://img.shields.io/github/v/release/arghena/insight?include_prereleases&style=for-the-badge&logo=github&label=release&labelColor=1a1b26" alt="Release" /></a>
<a href="https://github.com/arghena/insight/blob/canary/LICENSE"><img src="https://img.shields.io/github/license/arghena/insight?style=for-the-badge&logo=opensourceinitiative&label=license&labelColor=1a1b26" alt="License" /></a>

</div>

<!-- markdownlint-enable MD033 -->

## Features

- Use the `insight.toml` config file to customize the formatters and linters your project needs.
- Runs formatters and linters concurrently.
- Supports using [commitlint](https://commitlint.js.org) to check the pull request title.
- Responds to [`on.schedule`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule) events.
- Lets you customize formatter and linter versions and arguments.
- Supports [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) patterns to match exactly the files you want to check.
- Generates a neat GitHub Actions job summary with an error table and collapsible logs.
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
    steps:
      - name: Checkout repository
        # If `check-pull-request-title` is set to `true`,
        # it's recommended to remove `actions/checkout`.
        uses: actions/checkout@v6
      - name: Run Insight
        uses: arghena/insight@v0.1.0-canary.36
        with:
          # The path to the Insight config file.
          # Default: '.github/insight.toml'
          config-path: ''
          # Use `commitlint` to check the pull request title.
          # Default: 'false'
          check-pull-request-title: ''
          # The title of pull request event.
          # Default: ${{ github.event.pull_request.title }}
          pull-request-title: ''
          # The name of the event that triggered the workflow run.
          # Default: ${{ github.event_name }}
          event-name: ''
          # Personal access token (PAT) used to fetch the repository.
          # Default: ${{ github.token }}
          token: ''
          # Repository name with owner.
          # Default: ${{ github.repository }}
          repository: ''
          # The number of the pull request to check.
          # Default: ${{ github.event.pull_request.number }}
          pull-request-number: ''
```

## Configure Insight

> [!NOTE]
> You can refer to our [examples](https://github.com/arghena/insight/tree/canary/examples).

```toml
[match]
# Match dotfiles.
# Default: false
dot = true

[schedule]
# Linters to run on `on.schedule` events.
# Default: []
linters = ["cargo-deny"]

[formatters]
# Glob patterns for files that trigger formatters.
# Default: []
prettier = ["**/*.ts"]
cargo-fmt = ["**/*.rs"]

[linters]
# Glob patterns for files that trigger linters.
# Default: []
check-dist = ["src/**/*.ts", "**/package.json", "**/pnpm-lock.yaml"]
cargo-deny = ["**/Cargo.toml", "**/Cargo.lock"]
typos = ["**/*", "!dist/**"]

[args.formatters]
# Arguments passed to formatters.
# Default: []
cargo-fmt = ["--all"]

[args.linters]
# Arguments passed to linters.
# Default: []
check-dist = ["prepare"]

[versions]
# Lock formatter/linter versions.
# Default: "latest"
prettier = "3.6.2"
```

## Available Formatters

| Tool                                             | Formatter name | Accepts File Paths |
| ------------------------------------------------ | -------------- | :----------------: |
| [rustfmt](https://github.com/rust-lang/rustfmt)  | `cargo-fmt`    |                    |
| [prettier](https://github.com/prettier/prettier) | `prettier`     |         ✅         |
| [shfmt](https://github.com/mvdan/sh)             | `shfmt`        |         ✅         |
| [tombi](https://github.com/tombi-toml/tombi)     | `tombi`        |         ✅         |

## Available Linters

| Tool                                                                                   | Linter name         | Accepts File Paths | Supports scheduling |
| -------------------------------------------------------------------------------------- | ------------------- | :----------------: | :-----------------: |
| [actionlint](https://github.com/rhysd/actionlint)                                      | `actionlint`        |         ✅         |                     |
| [alex](https://github.com/get-alex/alex)                                               | `alex`              |         ✅         |                     |
| [ast-grep](https://github.com/ast-grep/ast-grep)                                       | `ast-grep`          |         ✅         |                     |
| [clippy](https://github.com/rust-lang/rust-clippy)                                     | `cargo-clippy`      |                    |                     |
| [cargo-deny](https://github.com/EmbarkStudios/cargo-deny)                              | `cargo-deny`        |                    |         ✅          |
| [cargo-msrv](https://github.com/foresterre/cargo-msrv)                                 | `cargo-msrv`        |                    |                     |
| [check-dist](https://github.com/arghena/insight/blob/canary/src/linters/check-dist.ts) | `check-dist`        |                    |                     |
| [eslint](https://github.com/eslint/eslint)                                             | `eslint`            |         ✅         |                     |
| [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)                   | `markdownlint-cli2` |         ✅         |                     |
| [node-audit](https://github.com/arghena/insight/blob/canary/src/linters/node-audit.ts) | `node-audit`        |                    |         ✅          |
| [shellcheck](https://github.com/koalaman/shellcheck)                                   | `shellcheck`        |         ✅         |                     |
| [tombi](https://github.com/tombi-toml/tombi)                                           | `tombi`             |         ✅         |                     |
| [trivy](https://github.com/aquasecurity/trivy)                                         | `trivy`             |                    |                     |
| [tsc](https://github.com/microsoft/TypeScript)                                         | `tsc`               |                    |                     |
| [typos](https://github.com/crate-ci/typos)                                             | `typos`             |         ✅         |                     |
| [vale](https://github.com/errata-ai/vale)                                              | `vale`              |         ✅         |                     |
| [yamllint](https://github.com/adrienverge/yamllint)                                    | `yamllint`          |         ✅         |                     |

## Contributing

Please refer to our [CONTRIBUTING.md](https://github.com/arghena/insight/blob/canary/.github/CONTRIBUTING.md).

## Security

> [!NOTE]
> If you believe you have found a security vulnerability in Insight, we encourage you to **responsibly disclose this and NOT open a public issue**.

Please refer to our [SECURITY.md](https://github.com/arghena/insight/blob/canary/.github/SECURITY.md).

## Releases

The version naming of Insight follows [Semantic Versioning 2.0.0](https://semver.org/#semantic-versioning-200).

### Long-Term Support

> [!NOTE]
> When Insight releases a new major version, the previous stable version will be designated as an LTS version.

The LTS version of Insight provides security updates and bug fixes for six months.

### Release Table

| Insight | Node.js | Codename | Released at | End of Life |
| ------- | ------- | -------- | ----------- | ----------- |
| v0.1.0  | v24     | Galileo  | -           | -           |

## License

Insight is distributed under the [MIT License](https://github.com/arghena/insight/blob/canary/LICENSE).
