import os
import requests
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage 

load_dotenv()

GET_API_URL = "http://localhost:8080/api/problems"
POST_API_URL = "http://localhost:8080/testcase"
GPT_API_KEY = os.getenv("GPT_API_KEY")

def fetch_problem_list():
    return requests.get(GET_API_URL).json()

def fetch_problem_detail(problem_id):
    return requests.get(f"http://orchestrator:8080/api/problems/{problem_id}").json()

STORAGE_BASE_URL = os.getenv("STORAGE_BASE_URL")

def generate_testcase(problem_id, detail):
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

    user_message = f"""
        문제 ID: {problem_id}
        시간 제한(ms): {detail['time_ms']}
        메모리 제한(MB): {detail['mem_mb']}
        알고리즘 분류: {", ".join(detail['categories'])}

        ===== 문제 설명 =====
        {detail['statement']}

        ===== 입력 형식 =====
        {detail['input_format']}

        ===== 출력 형식 =====
        {detail['output_format']}

        ===== 제약 조건 =====
        {detail['constraints']}
        """
    
    llm = ChatOpenAI(model_name="gpt-4o-mini", openai_api_key=GPT_API_KEY, temperature=0.3)
    messages = [
        SystemMessage(content=system_message),
        HumanMessage(content=user_message)
    ]

    response = llm(messages)
    return response.content

def upload_testcase(problem_id, testcase_text):
    url = f"{POST_API_URL}/{problem_id}/tests/ai"
    data = {
        "content": testcase_text
    }
    response = requests.post(url, json=data)
    response.raise_for_status()
    return response.json()

def run():
    problems = fetch_problem_list()

    print(f"[+] 총 {len(problems)}개의 문제 가져옴")
    
    for problem in problems:
        problem_id = problem["id"]
        detail = fetch_problem_detail(problem_id)

        print(f"[+] 문제 ID 받음: {problem_id}")

        testcase = generate_testcase(problem_id, detail)

        # print("[+] 테스트케이스 생성 완료")
        # print("===== 생성된 테스트케이스 =====")
        # print(f"tier: {tier}, stage: {stage}\ntestcase: {testcase}")
        # print("======================")
        result = upload_testcase(problem_id, testcase)
        print(f"[OK] 테스트케이스 저장 완료 → {result}")


if __name__ == "__main__":
    run()