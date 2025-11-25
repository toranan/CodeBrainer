FROM maven:3.9.9-eclipse-temurin-21 AS build

RUN rm -rf /var/lib/apt/lists/* \
 && sed -i 's|http://archive.ubuntu.com/ubuntu|http://mirror.kakao.com/ubuntu|g' /etc/apt/sources.list \
 && sed -i 's|http://security.ubuntu.com/ubuntu|http://mirror.kakao.com/ubuntu|g' /etc/apt/sources.list

RUN apt-get update -o Acquire::CompressionTypes::Order::=gz \
    && apt-get install -y --fix-missing \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -f pom.xml dependency:go-offline
RUN mvn -f pom.xml package -DskipTests

RUN python3 -m venv /app/venv

RUN /app/venv/bin/pip install --upgrade pip

RUN /app/venv/bin/pip install \
    beautifulsoup4 \
    lxml \
    langchain \
    langchain-community \
    openai \
    python-dotenv \
    requests

FROM eclipse-temurin:21-jre

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

WORKDIR /app

COPY --from=build /app/venv /app/venv
COPY --from=build /app/target/orchestrator-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

