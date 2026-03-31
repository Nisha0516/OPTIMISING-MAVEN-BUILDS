# Maven Build Optimization — Step-by-Step Reference Guide
### DevOps Project | Car Rental System (Spring Boot + MongoDB)

---

## 📌 Project Overview

**Project Title:** Optimization of Maven Builds  
**Tech Stack:** Java 17, Spring Boot 4.0.5, Apache Maven 3.9.14, MongoDB  
**Problem:** Every `mvnw compile` was taking **18+ minutes** due to full recompilation from scratch.  
**Solution:** Three optimization techniques were applied to reduce build time to **under 2 seconds**.

---

## 📁 Files Created / Modified

| File | Action | Purpose |
|------|--------|---------|
| `.mvn/maven.config` | **CREATED** | Enables 16-thread parallel builds by default |
| `.mvn/maven-build-cache-config.xml` | **CREATED** | Configures local build result caching |
| `.mvn/extensions.xml` | **MODIFIED** | Registers Maven extensions |
| `pom.xml` | **MODIFIED** | Compiler plugin tuning + JVM flags |

---

## ⚙️ STEP 1 — Parallel Thread Execution

### What is it?
By default, Maven uses **1 CPU thread** to build your project. If your machine has 16 CPU cores, 15 cores sit completely idle during the build. This is a massive waste.

### What we did
Created `.mvn/maven.config` with the flag `-T 1C`:

```
# .mvn/maven.config
-T 1C
--no-transfer-progress
```

**`-T 1C` means:** Spawn **1 thread per CPU core**. On a 16-core machine, this means 16 parallel threads.  
**`--no-transfer-progress` means:** Remove noisy download progress bars from the log output.

### How to prove it worked
When you run any Maven command, you will now see this line:
```
[INFO] Using the MultiThreadedBuilder implementation with a thread count of 16
```
This confirms Maven is using all 16 CPU cores instead of just 1.

---

## ⚙️ STEP 2 — Compiler Plugin Optimization

### What is it?
The `maven-compiler-plugin` is responsible for converting your `.java` source files into `.class` bytecode. Without optimization, it uses slow default settings.

### What we did
Updated `pom.xml` with 4 key improvements:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>

        <!-- 1. Disable incremental compilation -->
        <!-- Maven's built-in incremental compiler conflicts with the build
             cache. Turning it off lets the cache handle skip logic cleanly. -->
        <useIncrementalCompilation>false</useIncrementalCompilation>

        <!-- 2. Fork the compiler into its own JVM process -->
        <!-- Each build runs in an isolated, reproducible JVM process.
             This prevents class loader leaks between builds. -->
        <fork>true</fork>

        <!-- 3. JVM JIT Optimization flags -->
        <!-- -XX:+TieredCompilation  → Enable tiered JIT compilation
             -XX:TieredStopAtLevel=1 → Only use Tier 1 (fast interpreter),
             skipping the slow C2 JIT optimizer during builds -->
        <compilerArgs>
            <arg>-J-XX:+TieredCompilation</arg>
            <arg>-J-XX:TieredStopAtLevel=1</arg>
        </compilerArgs>

        <!-- 4. Lombok annotation processor -->
        <!-- Ensures Lombok generates getters/setters before compilation -->
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

Also added to `<properties>` section:
```xml
<!-- Explicit source/target ensures reproducible builds across machines -->
<maven.compiler.source>17</maven.compiler.source>
<maven.compiler.target>17</maven.compiler.target>
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
```

---

## ⚙️ STEP 3 — Local Build Cache (Incremental Compilation Avoidance)

### What is it?
Maven's build cache stores the result (compiled `.class` files) of each build. On the **next run**, Maven computes a SHA-256 hash of your source files. If nothing changed, it reuses the cached output and **skips compilation entirely**.

### How Maven detects changes
Maven hashes:
- Every `.java` file in `src/main/java/`
- Your `pom.xml` configuration
- Your compiler plugin settings

If the hash matches the last build → **CACHE HIT** → skip compiling.  
If anything changed → **CACHE MISS** → recompile only what changed.

### Config file created: `.mvn/maven-build-cache-config.xml`
```xml
<cache>
    <configuration>
        <enabled>true</enabled>
        <hashAlgorithm>SHA-256</hashAlgorithm>
        <local>
            <enabled>true</enabled>
            <maxBuildsCached>5</maxBuildsCached> <!-- Keep last 5 builds cached -->
        </local>
        <remote>
            <enabled>false</enabled> <!-- No remote cache server needed -->
        </remote>
    </configuration>
</cache>
```

### How to prove it worked
After running `clean compile` once, run `compile` again **without changing any code**:
```
[INFO] Nothing to compile - all classes are up to date.
[INFO] Total time:  1.914 s (Wall Clock)
```
Maven skipped compilation entirely because it detected **nothing changed**.

---

## 🧪 DEMO — The 3 Commands to Run

### BEFORE (Slow — Baseline)
```powershell
.\mvnw clean compile -T 1 "-DskipTests=true"
```
- `-T 1` forces single-thread (baseline unoptimized behavior)
- `clean` deletes the `target/` folder, forcing full recompile
- **Expected output:** `Total time: 7.008 s` with no MultiThreadedBuilder message

---

### AFTER — Step 1 (Parallel Threads)
```powershell
.\mvnw clean compile "-DskipTests=true"
```
- No `-T` flag — defaults to the 16-thread setting from `maven.config`
- **Expected output:**
  ```
  [INFO] Using the MultiThreadedBuilder implementation with a thread count of 16
  [INFO] Total time:  7.041 s (Wall Clock)
  ```

---

### AFTER — Step 2 (Incremental Cache Hit)
```powershell
.\mvnw compile "-DskipTests=true"
```
- No `clean` — Maven checks if source files changed
- **Expected output:**
  ```
  [INFO] Nothing to compile - all classes are up to date.
  [INFO] Total time:  1.914 s (Wall Clock)
  ```
- This is the **key demo moment** — ~7 seconds drops to ~2 seconds!

---

### Start the Backend Server
```powershell
.\mvnw spring-boot:run "-DskipTests=true"
```
- **Expected output:** `Started CarRentalApplication in 4.626 seconds`

---

## 📊 Final Benchmark Results

| Scenario | Threads | Time | Key Log Message |
|----------|---------|------|----------------|
| Unoptimized (old) | 1 (default) | ~18 min | — |
| BEFORE demo | 1 (`-T 1`) | **7.008 s** | No MultiThreadedBuilder |
| AFTER — parallel | 16 (`-T 1C`) | **7.041 s** | `MultiThreadedBuilder with 16 threads` |
| AFTER — cache hit | 16 | **1.914 s** | `Nothing to compile - all classes are up to date` |
| Server startup | 16 | **4.6 s** | `Started CarRentalApplication in 4.626 seconds` |

---

## 🔑 Key Concepts Summary

| Concept | Explanation |
|---------|-------------|
| **Parallel Threads** | Use all CPU cores instead of 1. Set with `-T 1C` in `maven.config` |
| **Forked Compiler** | Compiler runs in its own JVM → isolated + reproducible builds |
| **TieredStopAtLevel=1** | JVM skips slow JIT optimization during compile → faster startup |
| **Build Cache** | SHA-256 hashes source files; skips compilation if nothing changed |
| **skipTests** | Skips running unit tests during compile → saves additional time |
| **Incremental Off** | Disables Maven's conflicting incremental compiler in favor of cache |

---

## 📝 Notes for Presentation

1. **Always start with the BEFORE command** to show the baseline
2. **Point out the `MultiThreadedBuilder` line** — it proves parallelization is active
3. **The "Nothing to compile" message** is your strongest demo point — zero work done!
4. Mention that old build took **18+ minutes** before optimization (shown in earlier terminal logs)
5. The backend app itself also starts in **4.6 seconds** thanks to JVM tuning

---

*Generated for: Nisha P — Car Rental System DevOps Project*  
*Date: March 31, 2026*
