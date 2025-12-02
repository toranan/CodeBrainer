FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src src

RUN mvn -f pom.xml dependency:go-offline
RUN mvn -f pom.xml package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/orchestrator-0.0.1-SNAPSHOT.jar app.jar

# 문제 파일 복사 (배포 시 필요)
COPY storage /data/storage

EXPOSE 8080

# Set JVM memory options to prevent OOM (optimized for 1GB Railway limit)
ENTRYPOINT ["java", "-Xmx768m", "-Xms384m", "-XX:MaxMetaspaceSize=128m", "-XX:+UseG1GC", "-jar", "app.jar"]

