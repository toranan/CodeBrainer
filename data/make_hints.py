import os
import requests
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage 

load_dotenv()

GET_API_URL = "http://localhost:8080/api/problems"
POST_API_URL = "http://localhost:8080/hint"
GPT_API_KEY = os.getenv("GPT_API_KEY")

def fetch_problem_list():
    return requests.get(GET_API_URL).json()

def fetch_problem_detail(problem_id):
    resp = requests.get(f"{GET_API_URL}/{problem_id}")
    resp.raise_for_status()
    return resp.json()

def fetch_stage(problem_id):
    return requests.get(f"{POST_API_URL}/{problem_id}/stage").json()["stage"]


STORAGE_BASE_URL = os.getenv("STORAGE_BASE_URL")


def generate_hint(problem_id, tier, stage, time_ms, mem_mb, categories,
                constraints, input_format, output_format, statement):
    system_message = (
        "너는 문제를 보고 소스코드 작성에 대해 학생이 문제를 차근차근 풀 수 있도록 도와주는 선생님이야. 문장은 간결하게 작성하고, 존댓말을 사용하며, 어려운 표현과 이모티콘, 불필요한 미사여구는 쓰지 마.\n"
        "공통 규칙:\n"
        "문장은 간결하게 작성해.\n"
        "한자어나 어려운 표현은 피해.\n"
        "이모티콘, 미사여구, 과도한 비유를 사용하지 마.\n"
        "문제에 없는 변수는 사용하지 마. 필요한 경우에는 반드시 이유를 설명한 뒤 사용해.\n"
        "핵심만 줘. 쓸데없는 마무리 절대 멘트 금지. 다음 단계 이런 다음을 기약하는 말 절대 하지마.\n"
        "무엇을 안내한다, 제시한다, ~는 다음과 같다와 같이 내가 무엇을 요청했는지 드러내는 말 절대 하지 마.\n"
        "Tier별 규칙: \n"
        "tier가 BRONZE: 알고리즘의 이름과 설명을 알려줘.\n"
        "tier가 SILVER: 1번째 힌트면) 알고리즘 이름 언급 금지. 구현 방법을 글로 작성해. 문제 예시를 들어 쉽게 설명해.\n"
        "tier가 SILVER: 2번째 힌트면) 알고리즘 이름 명시해. 구현의 핵심 모듈과 핵심 절차만 간단히 설명해.\n"
        "tier가 GOLD or PLATINUM: 1번째 힌트면) 알고리즘 이름 언급 금지. 어떤 알고리즘을 써야 하는지, 문제의 구조를 활용하여 방향을 제시해. 알고리즘의 정의는 반드시 포함해.\n"
        "tier가 GOLD or PLATINUM: 2번째 힌트면) 알고리즘 이름을 명시해. 왜 이 알고리즘을 사용해야 하는지, 문제의 특징을 근거로 쉽게 설명해. 구현 방법을 먼저 글로 생각한 뒤, 요약하여 제시해.\n"
        "tier가 GOLD or PLATINUM: 3번째 힌트면) 알고리즘 구현 방법 전체를 글로 제시해. 코드 금지. 이해하기 쉽도록 단계별로 나눠 설명해.\n"
        "tier가 PLATINUM: 4번째 힌트면) 코드 형태가 아닌 슈도코드로 핵심 모듈만 간결히 제시해. 각 모듈이 왜 필요한지, 예외 처리 등 부가적인 요소는 왜 포함해야 하는지를 간단히 설명합니다."
    )

    user_message = f"""
        문제 ID: {problem_id}
        난이도(티어): {tier}
        요청 힌트 단계: {stage}
        시간 제한(ms): {time_ms}
        메모리 제한(MB): {mem_mb}
        알고리즘 분류: {", ".join(categories)}

        ===== 문제 설명 =====
        {statement}

        ===== 입력 형식 =====
        {input_format}

        ===== 출력 형식 =====
        {output_format}

        ===== 제약 조건 =====
        {constraints}
        """
    
    llm = ChatOpenAI(model_name="gpt-4o-mini", openai_api_key=GPT_API_KEY, temperature=0.3)
    messages = [
        SystemMessage(content=system_message),
        HumanMessage(content=user_message)
    ]

    response = llm(messages)
    return response.content

def upload_hint(problem_id, hint_text):
    url = f"{POST_API_URL}/{problem_id}/tests/ai"
    data = {
        "content": hint_text
    }
    try: 
        response = requests.post(url, json=data)
        if response.status_code == 500:
            print(f"[SKIP] 문제 {problem_id}: 서버에서 힌트 저장 불가(이미 존재함?) → 건너뜀")
            return None
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        print(f"[SKIP] 문제 {problem_id}: 업로드 실패({e}) → 건너뜀")
        return None

def run():
    problems = fetch_problem_list()

    print(f"[+] 총 {len(problems)}개의 문제 가져옴")
    
    for problem in problems:
        problem_id = problem["id"]

        detail = fetch_problem_detail(problem_id)
        existing_hints = detail.get("hints", [])

        if len(existing_hints) > 0:
            print(f"[SKIP] 문제 {problem_id}: 이미 {len(existing_hints)}개 힌트 존재 → 건너뜀")
            continue

        tier = detail["tier"]
        stage = fetch_stage(problem_id)
        time_ms = detail["timeMs"]
        mem_mb = detail["memMb"]
        categories = detail["categories"]
        statement = detail["statementPath"]
        constraints = detail["constraints"]
        input_format = detail["inputFormat"]
        output_format = detail["outputFormat"]

        print(f"[+] 문제 ID 받음: {problem_id}")

        hint = generate_hint(
            problem_id, tier, stage, time_ms, mem_mb, categories,
            constraints, input_format, output_format, statement
        )

        # print("[+] 힌트 생성 완료")
        # print("===== 생성된 힌트 =====")
        # print(f"tier: {tier}, stage: {stage}\nhint: {hint}")
        # print("======================")
        result = upload_hint(problem_id, hint)
        print(f"[OK] 힌트 저장 완료 → {result}")


if __name__ == "__main__":
    run()