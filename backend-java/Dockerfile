# syntax=docker/dockerfile:1.7

# Stage 1: Build the Java application using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy build metadata first so dependency downloads are cached across source-only changes.
COPY pom.xml .
COPY .mvn ./.mvn
COPY mvnw .
RUN chmod +x ./mvnw \
    && sed -i 's/\r$//' ./mvnw
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B dependency:go-offline -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

# Copy the actual source code and build it
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw -B clean package -DskipTests

# Stage 2: Create a minimal lightweight JRE runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the compiled JAR file from the builder stage
COPY --from=build /app/target/*.jar app.jar

# Expose standard Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
