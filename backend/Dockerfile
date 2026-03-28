# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

RUN addgroup -S spyzier && adduser -S spyzier -G spyzier

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

RUN chown spyzier:spyzier app.jar

USER spyzier

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

CMD ["java", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
