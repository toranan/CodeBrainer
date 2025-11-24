import os
import requests
from dotenv import load_dotenv
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

load_dotenv()

GET_API_URL = os.getenv("GET_API")  # 문제 하나 랜덤 또는 큐에서 가져오는 API
POST_TEST_URL = os.getenv("POST_TEST_URL")  # /problems/{id}/tests/ai
GPT_API_KEY = os.getenv("GPT_API")

def fetch_problem():
    response = requests.get(GET_API_URL)
    response.raise_for_status()
    return response.json()


def generate_testcases(problem_id, title, description, tier, time_ms, mem_mb, categories):
    system_message = (
        "너는 알고리즘 문제를 보고 테스트케이스를 생성하는 전문 채점 시스템이야. "
        "출제자의 의도를 고려해 다양한 유형의 테스트케이스를 만들어야 해. "
        "각 테스트케이스는 다음 형식을 가진 JSON 배열 형태로만 출력해:\n\n"
        "[\n"
        "  {\"in\": \"입력 값\", \"out\": \"출력 값\", \"explanation\": \"케이스 설명\"},\n"
        "  ... (최대 50개)\n"
        "]\n\n"
        "- explanation은 어떤 예외를 일으키기 위한 case인지 설명\n"
        "- 문제 조건, 시간 제한, 메모리 제한, 알고리즘 분류를 반드시 고려해 극한/엣지 케이스 포함\n"
        "- JSON 이외의 말은 절대 출력하지 말 것."
    )

    user_message = (
        "문제 ID: {problem_id}\n"
        "제목: {title}\n"
        "난이도: {tier}\n"
        "시간 제한(ms): {time_ms}\n"
        "메모리 제한(MB): {mem_mb}\n"
        "알고리즘 분류: {categories}\n"
        "문제 설명:\n{description}\n\n"
        "위 정보를 기반으로 최대 50개의 테스트케이스 JSON 배열을 생성해줘."
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", user_message)
    ])

    llm = ChatOpenAI(
        model_name="gpt-4o-mini",
        openai_api_key=GPT_API_KEY,
        temperature=0.2
    )

    chain = LLMChain(llm=llm, prompt=prompt)

    response = chain.invoke({
        "problem_id": problem_id,
        "title": title,
        "tier": tier,
        "time_ms": time_ms,
        "mem_mb": mem_mb,
        "categories": ", ".join(categories),
        "description": description
    })

    return response["text"]


def upload_testcases(problem_id):
    url = f"{POST_TEST_URL}/{problem_id}/ai"
    response = requests.post(url)
    response.raise_for_status()
    return response.json()

def run():
    print("[+] 문제 데이터 가져오는 중…")
    problem = fetch_problem()

    problem_id = problem["id"]
    title = problem["title"]
    description = problem["statement"]
    tier = problem["tier"]
    time_ms = problem["timeMs"]
    mem_mb = problem["memMb"]
    categories = problem["categories"]

    print(f"[+] 문제 ID: {problem_id}")

    print("[+] 테스트케이스 생성 중…")
    testcase_json = generate_testcases(
        problem_id, title, description,
        tier, time_ms, mem_mb, categories
    )

    print("[+] 테스트케이스 생성 완료")

    temp_path = f"data/ai_testcase_{problem_id}.json"
    with open(temp_path, "w", encoding="utf-8") as f:
        f.write(testcase_json)

    print(f"[+] JSON 저장 완료 → {temp_path}")

    print("[+] Spring에 테스트케이스 생성 요청 전송 중…")
    result = upload_testcases(problem_id)

    print(f"[OK] 테스트케이스 저장 완료 → 총 {len(result)}개 저장됨")


if __name__ == "__main__":
    run()
