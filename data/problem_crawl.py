import requests
import os
import json
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# https://solved.ac/problems/level/19?sort=solved&direction=desc&page=1 레벨 1부터 19까지 돌린다.
# a[href^="https://www.acmicpc.net/problem/"] 이걸로 링크 접근해서 하나씩 긁어오기
# 한 레벨 당 20문제씩

load_dotenv()
API_HOST = os.getenv("API_HOST")

STATEMENT_DIR = os.getenv("STATEMENT_PATH", "./statements")
os.makedirs(STATEMENT_DIR, exist_ok=True)

BASE_BOJ = "https://www.acmicpc.net/problem"
BASE_SOLVED = "https://solved.ac/problems/level/{level}?sort=solved&direction=desc&page=1"

def save_statement(problem_id, text):
    path = f"{STATEMENT_DIR}/{problem_id}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"statement": text}, f, ensure_ascii=False)
    return path

base_url = "https://www.acmicpc.net/problem"
url = base_url + "/{id}"

def parse_boj_problem(problem_id):
    url = f"{BASE_BOJ}/{problem_id}"
    res = requests.get(url)

    if res.status_code != 200:
        print(f"BOJ 요청 실패 id={problem_id}")
        return None

    html = res.content.decode("utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")

    title = soup.select_one(".problem_title").get_text(strip=True)
    id = problem_id
    time = soup.select_one("#problem-info > tbody > tr > td:nth-child(1)").get_text(strip=True) 
    time_ms = time if time else "제한 없음" # 만약 초 면 ms로 변환
    mem = soup.select_one("#problem-info > tbody > tr > td:nth-child(2)").get_text(strip=True)
    mem_mb = mem if mem else "제한 없음" # 단위 생각하기
    lev = soup.select_one("body > div.wrapper > div.container.content > div.row > div:nth-child(3) > div > blockquote > span").get_text()
    level = lev if lev else ""
    txt = soup.select_one(".problem_description").get_text()
    description = txt if txt else ""
    inp = soup.select_one(".input").get_text() # 이거 예외처리, 입력예시랑 합치기
    input_format = inp if inp else ""
    output_format = soup.select_one(".output").get_text()
    algorithm = soup.select_one("#problem_tags > ul").get_text() # 이것도 정해진 형식대로 저장
    statement_path = save_statement(problem_id, description)

    return {
        "id": int(id),
        "title": title,
        "tier": level,
        "time_ms": time_ms,
        "mem_mb": mem_mb,
        "categories": algorithm,
        "input_format": input_format,
        "output_format": output_format,
        "statement_path": statement_path,
    }

def main():
    all_problems = []

    for level in range(1, 20):  # 레벨 1~19
        print(f"\n=== 레벨 {level} 문제 수집 중 ===")

        url = BASE_SOLVED.format(level=level)
        res = requests.get(url)

        if res.status_code != 200:
            print(f"solved.ac 접근 실패 (level={level})")
            continue

        soup = BeautifulSoup(res.text, "html.parser")

        problem_ids = []
        for a in soup.find_all("a"):
            href = a.get("href", "")
            if "acmicpc.net/problem/" in href:
                pid = href.split("/")[-1]
                if pid.isdigit():
                    problem_ids.append(pid)
                    if len(problem_ids) == 20:
                        break

        print(f"문제 {len(problem_ids)}개:", problem_ids)

        for pid in problem_ids:
            print(f"파싱 중… {pid}")
            data = parse_boj_problem(pid)
            if data:
                all_problems.append(data)
                print(f"수집 완료: {pid}")

    if all_problems:
        try:
            response = requests.post(f"{API_HOST}/api/problems/", json=all_problems, timeout=10)
            if response.status_code == 201:
                print(f"Save to DB, {all_problems}")
            else:
                print(f"API 에러 - 상태코드: {response.status_code}, 응답: {response.text}")
        except requests.exceptions.ConnectionError:
            print(f"연결 에러: Spring 서버가 실행 중인지 확인하세요 ({API_HOST})")
        except requests.exceptions.Timeout:
            print(f"타임아웃 에러")
        except Exception as e:
            print(f"예상치 못한 에러: {e}")
    else:
        print("저장할 문제 없음")


    # 최종 결과 저장
    with open("problems.json", "w", encoding="utf-8") as f:
        json.dump(all_problems, f, ensure_ascii=False, indent=2)



    print("\n=== 전체 작업 완료 ===")
    print("problems.json 파일 생성됨")


if __name__ == "__main__":
    main()