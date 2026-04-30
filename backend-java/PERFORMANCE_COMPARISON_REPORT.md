# Performance Comparison Report: Optimizing Maven Builds

## Scenario

The backend Maven build was taking longer than necessary because dependency resolution, repeated compilation, test execution, and CI/Docker builds were not optimized for reuse.

## Objective

Optimize Maven build performance for the `backend-java` Spring Boot service by:

- analyzing the build process
- removing unused dependencies
- enabling parallel Maven behavior
- improving repeat build performance through caching

## Build Process Analysis

This is a single-module Maven project. Because there are no multiple Maven modules to compile independently, parallel builds do not give the same benefit as they would in a large multi-module project. The main performance gains come from:

- parallel dependency download
- Maven multithreaded builder configuration
- avoiding unnecessary clean builds
- Maven build cache reuse
- GitHub Actions Maven cache reuse
- Docker BuildKit cache mounts

## Optimized Maven Configuration

### 1. Parallel Maven Defaults

Configured in `.mvn/maven.config`:

```text
-T 1C
-Dmaven.artifact.threads=20
--no-transfer-progress
```

Effect:

- `-T 1C` enables Maven's multithreaded builder using one thread per CPU core.
- `-Dmaven.artifact.threads=20` downloads Maven artifacts in parallel.
- `--no-transfer-progress` reduces noisy CI logs.

### 2. Maven Build Cache

Configured through:

- `.mvn/extensions.xml`
- `.mvn/maven-build-cache-config.xml`

Effect:

- Maven calculates a checksum of build inputs.
- If inputs have not changed, Maven restores outputs from the local build cache.
- Repeated builds skip cached plugin work such as resources, compile, test compile, Surefire, and jar packaging.

### 3. Compiler Optimization

Configured in `pom.xml`:

```xml
<fork>true</fork>
<compilerArgs>
    <arg>-J-XX:+TieredCompilation</arg>
    <arg>-J-XX:TieredStopAtLevel=1</arg>
</compilerArgs>
```

Effect:

- Runs compilation in a forked compiler process.
- Uses faster JVM warmup settings for short build tasks.

### 4. Parallel JUnit 5 Test Execution

Configured in `src/test/resources/junit-platform.properties`:

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
junit.jupiter.execution.parallel.config.strategy=dynamic
```

Effect:

- Allows JUnit Jupiter tests to run concurrently where safe.

## Dependency Cleanup

Maven dependency analysis was run with:

```powershell
.\mvnw.cmd -B dependency:analyze
```

Result:

- Main Spring Boot starters were kept because they provide required auto-configuration and managed transitive dependencies.
- The two heavy Spring Boot test starters were removed because current tests only use JUnit Jupiter APIs.
- Replaced test dependencies with direct `org.junit.jupiter:junit-jupiter`.

Removed:

- `spring-boot-starter-data-mongodb-test`
- `spring-boot-starter-webmvc-test`

Added:

- `org.junit.jupiter:junit-jupiter`

Validation after cleanup:

```powershell
.\mvnw.cmd -B "-Dmaven.build.cache.enabled=false" clean verify
```

Result:

```text
BUILD SUCCESS
Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
Total time: 16.949 s (Wall Clock)
```

## Performance Comparison

| Build Case | Command | Result |
|---|---|---:|
| Baseline clean compile from earlier unoptimized log | `.\mvnw clean compile -T 1 "-DskipTests=true"` | 9.751 s |
| Parallel clean compile from earlier optimized log | `.\mvnw clean compile "-DskipTests=true"` | 9.024 s |
| Incremental compile from earlier optimized log | `.\mvnw compile "-DskipTests=true"` | 3.312 s |
| Current full clean verify after dependency cleanup | `.\mvnw.cmd -B "-Dmaven.build.cache.enabled=false" clean verify` | 16.949 s |
| Current optimized warm verify | `.\mvnw.cmd -B verify` | 5.927 s |
| Current optimized cache-hit verify | `.\mvnw.cmd -B verify` | 3.788 s |

## Cache-Hit Evidence

The optimized repeated build produced:

```text
Found cached build, restoring com.example:demo from cache
Skipping plugin execution (cached): resources:resources
Skipping plugin execution (cached): compiler:compile
Skipping plugin execution (cached): resources:testResources
Skipping plugin execution (cached): compiler:testCompile
Skipping plugin execution (cached): surefire:test
Skipping plugin execution (cached): jar:jar
BUILD SUCCESS
Total time: 3.788 s (Wall Clock)
```

## CI and Docker Optimizations

GitHub Actions:

- caches Maven dependencies with `actions/setup-java`
- caches Maven build-cache output from `~/.m2/build-cache`
- uses a fast skip-tests job before the full verify job
- disables Maven build cache during artifact upload verify job to guarantee `target/classes` exists

Docker:

- backend Dockerfile uses BuildKit cache mounts for `/root/.m2`
- `dependency:go-offline` warms Maven dependencies before source code is copied
- Docker layer reuse reduces repeated image build time

## Conclusion

The Maven build was optimized by combining dependency cleanup, parallel Maven settings, JUnit parallel test configuration, Maven build cache, CI cache reuse, and Docker BuildKit caching. Since this project is single-module, the largest practical improvement comes from cache reuse and avoiding unnecessary rebuilds. The repeated optimized verify build improved to 3.788 seconds after cache restoration.
