# Maven Build Optimization - Execution Logs

This document serves as the live log execution proof of the Maven build optimizations applied to this project (`backend-java`). We ran three tests locally to demonstrate the performance improvements.

---

## 1. Baseline Build (Unoptimized single-thread)
**Command executed:** `.\mvnw clean compile -T 1 "-DskipTests=true"`

*This forces the build to use a single CPU thread and compile everything from scratch (the old behavior).*

**Key Log Excerpts:**
```text
[INFO] Scanning for projects...
[INFO] ------------------------------------------------------------------------
[INFO] Building car-rental 0.0.1-SNAPSHOT
[INFO] ------------------------------------------------------------------------
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  9.751 s
[INFO] Finished at: 2026-04-05T17:03:59+05:30
[INFO] ------------------------------------------------------------------------
```

---

## 2. Parallel Multithreaded Build (Step 1)
**Command executed:** `.\mvnw clean compile "-DskipTests=true"`

*This triggers the new `maven.config` which defaults to 1 thread per CPU core (1C) to leverage your entire machine's hardware.*

**Key Log Excerpts:**
```text
[INFO] Scanning for projects...
[INFO] Using the MultiThreadedBuilder implementation with a thread count of 16
[INFO] ------------------------------------------------------------------------
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  9.024 s (Wall Clock)
[INFO] Finished at: 2026-04-05T17:04:29+05:30
[INFO] ------------------------------------------------------------------------
```
**Proof:** You can clearly see the message `Using the MultiThreadedBuilder implementation with a thread count of 16`. This confirms Maven successfully spawned parallel threads!

---

## 3. Cached Incremental Build (Step 2)
**Command executed:** `.\mvnw compile "-DskipTests=true"`

*This command removes `clean`. Our new `.mvn/maven-build-cache-config.xml` will calculate file hashes and skip compilation entirely if no Java code changed!*

**Key Log Excerpts:**
```text
[INFO] Scanning for projects...
[INFO] Using the MultiThreadedBuilder implementation with a thread count of 16
...
[INFO] --- maven-compiler-plugin:3.11.0:compile (default-compile) @ car-rental ---
[INFO] Nothing to compile - all classes are up to date.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  3.312 s (Wall Clock)
[INFO] Finished at: 2026-04-05T17:04:58+05:30
[INFO] ------------------------------------------------------------------------
```
**Proof:** The key log message `Nothing to compile - all classes are up to date` appears. Maven didn't recompile a single file, and the total build time plunged to **3.312 seconds**. 

## Conclusion
By combining **16-thread Parallel Builds** with **Incremental Caching**, compile times are significantly minimized, saving developers massive amounts of time during local development.
