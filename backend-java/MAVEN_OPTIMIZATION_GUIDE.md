# Maven Build Optimization Guide

## Project Context

- Project: Car Rental System backend
- Stack: Spring Boot, Java 17, Maven Wrapper, GitHub Actions, Docker
- Goal: reduce repeated build time and make the pipeline easier to explain in a DevOps presentation

This backend is a single-module Maven project. That matters because some Maven optimizations help multi-module projects far more than single-module ones. For this repo, the biggest wins come from cache reuse, avoiding unnecessary `clean`, Docker layer reuse, and running tests correctly.

## What Was Optimized

### 1. Maven wrapper reliability on Windows

`mvnw.cmd` was patched so it works correctly when the local Maven home is a normal directory instead of a linked path. That makes the wrapper usable for local demos on Windows.

### 2. Smarter default Maven options

The file `.mvn/maven.config` now keeps these defaults:

```text
-T 1C
-Dmaven.artifact.threads=20
--no-transfer-progress
```

What each one does:

- `-T 1C`: uses one Maven build thread per CPU core
- `-Dmaven.artifact.threads=20`: resolves artifacts in parallel during dependency downloads
- `--no-transfer-progress`: keeps logs short and readable in CI

Important note:

- In a single-module project, `-T 1C` does not create a huge compile-time speedup by itself
- It is still safe to keep, but it should not be presented as the main reason this project gets faster

### 3. Maven build cache extension

The project now uses the official Apache Maven build-cache extension through `.mvn/extensions.xml`.

That means Maven can reuse cached build outputs when the project inputs have not changed. The cache configuration lives in `.mvn/maven-build-cache-config.xml`.

### 4. Correct JUnit 5 parallel test setup

The previous configuration used Surefire parallel settings in `pom.xml`, but JUnit 5 parallel execution is best enabled through `junit-platform.properties`.

This project now uses:

`src/test/resources/junit-platform.properties`

with:

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
```

This is the cleaner and more accurate way to describe test parallelization in a Spring Boot project using JUnit Jupiter.

### 5. CI cache reuse in GitHub Actions

The workflow `.github/workflows/build.yml` was updated so the Maven build-cache directory is keyed from the Maven config files instead of the commit SHA.

Why this is better:

- old approach: cache key changed every commit, so reuse was weaker
- new approach: cache is reused until the Maven build inputs actually change

The CI job now runs:

```bash
./mvnw -B verify
```

This is better for a DevOps demo because it exercises the full `verify` lifecycle. On a cold cache it runs the full build and tests; on a warm cache Maven can restore the verified outputs.

### 6. Faster Docker builds

The Dockerfile now uses BuildKit cache mounts for Maven:

```dockerfile
RUN --mount=type=cache,target=/root/.m2 ...
```

This speeds up repeated container builds because Maven dependencies do not need to be downloaded from scratch every time.

## Best Demo Commands

Run these inside `backend-java/`.

### First build

```powershell
.\mvnw clean verify
```

Use this to show a cold build from scratch.

### Repeated build without deleting outputs

```powershell
.\mvnw verify
```

This is the most important command for the demo. It shows how much time is saved when you do not force Maven to rebuild everything unnecessarily.

## Latest Local Verification

These were the results from the latest validation run on this repo:

- first successful `.\mvnw -B verify`: `6.860 s`
- second repeated `.\mvnw -B verify`: `1.761 s`
- cache proof line: `Found cached build, restoring com.example:demo from cache`

### Dependency warmup for containers

```powershell
docker build -t carrental-backend .
```

Then run the same command a second time and point out the cached Maven dependency layers.

## Presentation Talking Points

- Do not over-claim `-T 1C` for a single-module project
- The strongest optimization story here is cache reuse, not raw parallel module compilation
- Avoiding `clean` on every developer build is one of the easiest real-world Maven optimizations
- CI cache keys should be based on build inputs, not commit hashes
- Docker layer caching and Maven cache reuse are both part of DevOps optimization, not just local development optimization

## Verification Checklist

When you run the project on your own machine, look for:

- Maven wrapper starts successfully with `.\mvnw`
- build cache initialization messages from the Maven build-cache extension
- shorter times on the second `verify` run
- reused Docker layers on the second `docker build`

## Suggested Short Viva Explanation

"I optimized the Maven pipeline in four practical ways: reliable wrapper execution, cache-aware Maven configuration, correct JUnit 5 parallel test setup, and better cache reuse in CI and Docker builds. Since this backend is a single-module project, the biggest gains come from avoiding unnecessary rebuilds and re-downloads rather than from module-level parallelism alone."
