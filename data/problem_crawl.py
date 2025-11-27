import requests
import os
import json
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import time
import random

load_dotenv()
API_HOST="http://orchestrator:8080"

STATEMENT_DIR = os.getenv("STATEMENT_PATH", "./statements")
os.makedirs(STATEMENT_DIR, exist_ok=True)

BASE_BOJ = "https://www.acmicpc.net/problem"
BASE_SOLVED = "https://solved.ac/problems/level/{level}?sort=solved&direction=desc&page={page}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

def join_examples(samples):
    inputs = []
    outputs = []
    for i, s in enumerate(samples, start=1):
        inputs.append(f"[예제 입력 {i}]\n{s['input']}")
        outputs.append(f"[예제 출력 {i}]\n{s['output']}")
    return "\n\n".join(inputs), "\n\n".join(outputs)


def save_statement(problem_id, text):
    path = f"{STATEMENT_DIR}/{problem_id}.json"
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"statement": text}, f, ensure_ascii=False)
    except Exception as e:
        print(f"[파일 저장 오류] {problem_id}: {e}")
    return path


def convert_level_to_tier(level_num: int) -> str:
    if 1 <= level_num <= 3:
        return "BRONZE"
    elif 4 <= level_num <= 8:
        return "SILVER"
    elif 9 <= level_num <= 13:
        return "GOLD"
    else:
        return "PLATINUM"


def parse_boj_problem(problem_id, tier):
    url = f"{BASE_BOJ}/{problem_id}"

    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
    except Exception as e:
        print(f"[BOJ 연결 오류] id={problem_id}, {e}")
        return None

    if res.status_code != 200:
        print(f"[BOJ 요청 실패] id={problem_id}, status={res.status_code}")
        return None

    html = res.content.decode("utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")
    # print(html)

    try:
        title = soup.select_one("#problem_title").get_text(strip=True)
    except:
        print(f"[파싱 오류] 제목 없음 id={problem_id}")
        return None

    time_ms = None
    try:
        time = soup.select_one("#problem-info > tbody > tr > td:nth-child(1)").get_text(strip=True)
        if "초" in time:
            time_ms = int(float(time.replace("초", "").strip()) * 1000)
        elif "ms" in time:
            time_ms = int(float(time.replace("ms", "").strip()))
    except:
        time_ms = None

    mem_mb = None
    try:
        mem = soup.select_one("#problem-info > tbody > tr > td:nth-child(2)").get_text(strip=True)
        if "MB" in mem:
            mem_mb = int(mem.replace("MB", "").strip())
        elif "KB" in mem:
            kb = int(mem.replace("KB", "").strip())
            mem_mb = max(1, kb // 1024)
    except:
        mem_mb = None

    try:
        description = soup.select_one("#problem_description").get_text("\n", strip=True)
    except:
        description = ""

    description += "\n\n입력:\n"
    try:
        description += soup.select_one("#problem_input").get_text("\n", strip=True)
    except:
        description += ""

    description += "\n\n출력:\n"
    try:
        description += soup.select_one("#problem_output").get_text("\n", strip=True)
    except:
        description += ""

    inputs = []
    outputs = []
    i = 1
    while True:
        si = soup.select_one(f"#sample-input-{i}")
        so = soup.select_one(f"#sample-output-{i}")
        if not si or not so:
            break

        raw_in = si.get_text("\n", strip=True)
        raw_out = so.get_text("\n", strip=True)

        inputs.append(f"[예제 입력 {i}]\n{raw_in}")
        outputs.append(f"[예제 출력 {i}]\n{raw_out}")
        i += 1

    input_format = "\n\n".join(inputs) if inputs else ""
    output_format = "\n\n".join(outputs) if outputs else ""

    categories = []
    try:
        solved_res = requests.get(f"https://solved.ac/api/v3/problem/show?problemId={problem_id}")
        if solved_res.status_code == 200:
            tag_data = solved_res.json().get("tags", [])
            for t in tag_data:
                for dn in t.get("displayNames", []):
                    if dn.get("language") == "ko":
                        categories.append(dn.get("name"))
    except:
        categories = []

    constraints = ""
    try:
        limit_section = soup.select_one("#problem_limit")
        if limit_section:
            constraints = limit_section.get_text("\n", strip=True)
    except Exception:
        constraints = ""

    if not constraints:
        lines = description.split("\n")
        picked = [
            ln for ln in lines
            if any(x in ln for x in ["≤", ">=", "<=", "범위", "제한", "조건"])
        ]
        constraints = "\n".join(picked)

    print(f"constraints = {constraints}")
    print(f"알고리즘: {categories}")
    return {
        "id": int(problem_id),
        "title": title,
        "tier": tier,
        "timeMs": time_ms,
        "memMb": mem_mb,
        "categories": categories,
        "inputFormat": input_format,
        "outputFormat": output_format,
        "statement": description,
        "constraints": constraints
    }


def main():
    all_problems = []

    for level in range(1, 20):
        tier = convert_level_to_tier(level)
        print(f"\n=== 레벨 {level} ({tier}) 문제 수집 중 ===")

        problem_ids = []
        page = 1

        while len(problem_ids) < 101:

            url = BASE_SOLVED.format(level=level, page=page)
            print(f" → 페이지 {page} 가져오는 중…")

            try:
                res = requests.get(url, headers=HEADERS, timeout=10)
            except Exception as e:
                print(f"[solved.ac 연결 오류] level={level}, page={page}, {e}")
                continue

            if res.status_code != 200:
                print(f"[solved.ac 요청 실패] level={level}, status={res.status_code}")
                continue

            soup = BeautifulSoup(res.text, "html.parser")
            found_this_page = []
            for a in soup.find_all("a"):
                href = a.get("href", "")
                if "acmicpc.net/problem/" in href:
                    pid = href.split("/")[-1]
                    if pid.isdigit():
                        found_this_page.append(pid)
            if not found_this_page:
                print(f" → 페이지 {page}에 더 이상 문제 없음 → 중단")
                break
            for pid in found_this_page:
                if pid not in problem_ids:
                    problem_ids.append(pid)
                if len(problem_ids) >= 101:
                    break

            page += 1

            print(f"문제 {len(problem_ids)}개 수집:", problem_ids)
            problem_ids = list(dict.fromkeys(problem_ids))

            for pid in problem_ids:
                print(f"파싱 중… {pid}")
                data = parse_boj_problem(pid, tier)
                time.sleep(random.uniform(0.3, 1.0))

                if data:
                    all_problems.append(data)
                    print(f"  → 완료")
                else:
                    print(f"  → 실패")

    if all_problems:
        for data in all_problems:
            try:
                response = requests.post(f"{API_HOST}/internal/problems", json=data, timeout=10)

                if response.status_code == 409:
                    print(f"[SKIP] id={data['id']} 이미 존재하여 건너뜀")
                    continue

                if response.status_code in (200, 201):
                    print(f"[DB 저장 완료] id={data['id']}")
                else:
                    print(f"[API 오류] id={data['id']} status={response.status_code}, body={response.text}")

            except requests.exceptions.ConnectionError:
                print(f"[연결 실패] Spring 서버 확인 필요: {API_HOST}")
                return
            except requests.exceptions.Timeout:
                print(f"[타임아웃] id={data['id']}")
            except Exception as e:
                print(f"[예상 밖 오류] id={data['id']}: {e}")
    else:
        print("저장할 문제 없음")


if __name__ == "__main__":
    main()
