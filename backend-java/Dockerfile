# Stage 1: Build the Java application using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Strategically copy pom.xml and dependencies first to leverage Docker caching
COPY pom.xml .
COPY .mvn ./.mvn
COPY mvnw .
# We use dependecy:go-offline to cache downloading the internet
RUN ./mvnw dependency:go-offline -B -Dorg.slf4j.simpleLogger.log.org.apache.maven.cli.transfer.Slf4jMavenTransferListener=warn

# Copy the actual source code and build it
COPY src ./src
# Build the application, skipping tests during image build phase
RUN ./mvnw clean package -DskipTests

# Stage 2: Create a minimal lightweight JRE runtime container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the compiled JAR file from the builder stage
COPY --from=build /app/target/*.jar app.jar

# Expose standard Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
