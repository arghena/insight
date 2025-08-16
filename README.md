<!--

NOTE:
This file will be bundled into the final product (`*.tar.gz`) when it is released,
so URLs should be used consistently within the file to point to project files, rather than local paths.
This is because users won't have access to those files locally when browsing the file.

-->

# Insight

Insight is a GitHub Action for checking pull requests.

It's designed to provide a unified config file so you can run various formatters and linters more efficiently.

## Features

- Use the `insight.toml` config file to customize the formatters and linters your project needs.
- Supports using [commitlint](https://commitlint.js.org) to check pull request titles.
- Responds to [`on.schedule`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule) and [`on.push.tags`](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore) events, respecting `.gitignore` when running linters.
- Can check build files in `dist/` using a `git diff` approach.
- Lets you customize formatter and linter versions and options.
- Supports [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) patterns to match exactly the files you want to check.
- Ships with minimal defaults to keep opinionated behavior to a minimum.

## Usage

```yaml
- name: Checkout repository
  uses: actions/checkout@v5
- name: Run Insight
  uses: arghena/insight@v0.1.0-canary.10
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
    # The type of pull request event.
    # Default: ${{ github.event.action }}
    pull-request-type: ''
    # The title of pull request event.
    # Default: ${{ github.event.pull_request.title }}
    pull-request-title: ''
    # Personal access token (PAT) used to fetch the repository.
    # Default: ${{ github.token }}
    token: ''
    # Repository name with owner.
    # Default: ${{ github.repository }}
    repository: ''
    # The number of the pull request to check
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

[pull_request]
# Check pull request title.
# Default: false
check_title = true

[schedule]
# Linters to run on `on.schedule` events.
# Default: []
tasks = ["cargo_deny"]

[push_tag]
# Formatters to run on `on.push.tags` events.
# Default: []
formatters = ["prettier"]
# Linters to run on `on.push.tags` events.
# Default: []
linters = ["check_dist", "eslint"]

[options.formatters]
# Options passed to formatters.
# Default: []
shfmt = ["-i", "4", "-ci"]

[options.linters]
# Options passed to linters.
# Default: []
check_dist = ["prepare"]
yamllint = ["--strict"]

[formatters]
# Glob patterns for files that trigger formatters.
# Default: []
prettier = ["**/*.yml", "**/*.ts", "**/*.md", "**/*.json"]
shfmt = ["etc/ci/*.sh"]

[linters]
# Glob patterns for files that trigger linters.
# Default: []
check_dist = ["src/**/*.ts", "package.json", "pnpm-lock.yaml"]
cargo_deny = ["Cargo.toml", "Cargo.lock"]
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
| [rustfmt](https://github.com/rust-lang/rustfmt)  | `cargo_fmt`    |
| [shfmt](https://github.com/mvdan/sh)             | `shfmt`        |
| [taplo](https://github.com/tamasfe/taplo)        | `taplo`        |

## Available Linters

| Tool                                                                                   | Linter name         | Supports scheduling |
| -------------------------------------------------------------------------------------- | ------------------- | :-----------------: |
| [check-dist](https://github.com/arghena/insight/blob/canary/src/linters/check-dist.ts) | `check_dist`        |                     |
| [eslint](https://github.com/eslint/eslint)                                             | `eslint`            |                     |
| [typos](https://github.com/crate-ci/typos)                                             | `typos`             |                     |
| [yamllint](https://github.com/adrienverge/yamllint)                                    | `yamllint`          |                     |
| [actionlint](https://github.com/rhysd/actionlint)                                      | `actionlint`        |                     |
| [ast-grep](https://github.com/ast-grep/ast-grep)                                       | `ast_grep`          |                     |
| [clippy](https://github.com/rust-lang/rust-clippy)                                     | `cargo_clippy`      |                     |
| [cargo-msrv](https://github.com/foresterre/cargo-msrv)                                 | `cargo_msrv`        |                     |
| [cargo-tarpaulin](https://github.com/xd009642/tarpaulin)                               | `cargo_tarpaulin`   |                     |
| [alex](https://github.com/get-alex/alex)                                               | `alex`              |                     |
| [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)                   | `markdownlint_cli2` |                     |
| [vale](https://github.com/errata-ai/vale)                                              | `vale`              |                     |
| [shellcheck](https://github.com/koalaman/shellcheck)                                   | `shellcheck`        |                     |
| [taplo](https://github.com/tamasfe/taplo)                                              | `taplo`             |                     |
| [cargo-deny](https://github.com/EmbarkStudios/cargo-deny)                              | `cargo_deny`        |         ✅          |

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
