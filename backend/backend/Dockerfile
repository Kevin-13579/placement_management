# Use official Maven/Java 17 image to build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies
RUN mvn dependency:go-offline -B
COPY src ./src
# Build the application
RUN mvn clean package -DskipTests

# Use lightweight JRE image for running
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Copy the built jar
COPY --from=build /app/target/*.jar app.jar
# Expose the default Spring Boot port
EXPOSE 8080
# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
