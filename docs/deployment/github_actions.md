# GitHub Actions Release Setup

This repo uses GitHub Actions for CI and release automation.

## Workflows

### CI
`.github/workflows/ci.yml` runs on pull requests and pushes to `main`.

It performs:
*   kiosk dependency install
*   kiosk tests
*   kiosk production build
*   Docker Compose config validation
*   kiosk container build without pushing for `linux/amd64` and `linux/arm64`

### Release
`.github/workflows/release.yml` runs on pushes to `main`.

It performs:
*   kiosk tests
*   kiosk production build
*   Docker Compose config validation
*   semantic-release
*   DockerHub login
*   kiosk multi-platform image build and push when semantic-release publishes a new release

## Semantic Release

Semantic release is configured in `release.config.cjs`.

Release tags use:

```text
kiosk-v${version}
```

Use Conventional Commit messages so semantic-release can choose the next version:

```text
fix(kiosk): handle printer error response
feat(automation): add real print workflow
feat!: change kiosk backend contract
```

## DockerHub Setup

Add these repository secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

Optionally add this repository variable:

```text
DOCKERHUB_REPOSITORY
```

If `DOCKERHUB_REPOSITORY` is not set, the release workflow uses:

```text
nirvana-kiosk
```

For example, with:

```text
DOCKERHUB_USERNAME=xiaochuanwang
DOCKERHUB_REPOSITORY=nirvana-kiosk
```

the pushed image is:

```text
xiaochuanwang/nirvana-kiosk
```

## Docker Image Tags

On each semantic-release publication, the release workflow pushes a multi-platform Docker image for:

```text
linux/amd64
linux/arm64
```

The pushed tags are:

```text
latest
${version}
kiosk-v${version}
sha-${git_sha}
```

The GitHub app release tag and the Docker `kiosk-v${version}` tag intentionally match.

## Notes

DockerHub publishing only happens when semantic-release publishes a new release. Commits that do not produce a release still run tests and builds but do not push an image.

The release workflow checks DockerHub configuration before running semantic-release. This avoids creating a GitHub release tag when the matching Docker image cannot be published.
