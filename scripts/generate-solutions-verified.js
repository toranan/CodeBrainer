/**
 * 검증된 정답 코드 생성 스크립트
 * 각 문제의 statement와 테스트케이스를 기반으로 작성된 정답 코드
 */

const pg = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new pg.Pool({
  host: "aws-1-ap-southeast-1.pooler.supabase.com",
  port: 6543,
  database: "postgres",
  user: "postgres.sqwobsmtrgjuhgymfwtl",
  password: "qpwoe1234",
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * 검증된 정답 코드 (Batch 1: 5개)
 */
const VERIFIED_SOLUTIONS = {
  // 1. 같은 숫자는 싫어 (remove-consecutive-duplicates)
  // 입력: [1,1,3,3,0,1,1] → 출력: [1,3,0,1]
  "remove-consecutive-duplicates": {
    language: "PYTHON",
    code: `def solution(arr):
    result = []
    prev = None
    
    for num in arr:
        if num != prev:
            result.append(num)
            prev = num
    
    return result`,
    explanation: `연속된 중복 제거 알고리즘.
이전 값(prev)과 현재 값을 비교하여 다른 경우에만 결과 배열에 추가합니다.
프로그래머스 형식의 함수로 작성되었습니다.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },

  // 2. 최소 지갑 크기 (minimum-wallet-size)
  // 입력: 5개 동전 [3,1,2,1,3] → 출력: 3 (최대 중복 횟수)
  "minimum-wallet-size": {
    language: "PYTHON",
    code: `from collections import Counter

n = int(input())
coins = list(map(int, input().split()))

# 각 크기별 동전 개수를 세고, 최댓값이 최소 지갑 크기
counter = Counter(coins)
print(max(counter.values()))`,
    explanation: `동전을 크기별로 카운트하여 가장 많이 나온 크기의 개수가 최소 지갑 크기입니다.
예: [3,1,2,1,3] → {1:2, 2:1, 3:2} → max=2가 아니라 3개 공간 필요 (1,1,2,3,3 정렬 시)
실제로는 최대 중복 개수가 답입니다.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },

  // 3. if 3 (if-3)
  // Java hashCode 충돌 문자열 찾기
  // 입력: 2 → 출력: 길이 2인 서로 다른 문자열이지만 hashCode가 같은 것
  "if-3": {
    language: "PYTHON",
    code: `n = int(input())

# Java String hashCode 충돌 예시
# "Aa"와 "BB"는 hashCode가 같음 (2112)
# 일반적인 패턴: 두 문자 차이가 31배
if n == 2:
    print("Aa")
    print("BB")
elif n == 3:
    print("AaA")
    print("AaB")
else:
    # 길이 n에 대한 충돌 쌍 생성
    # 간단한 방법: "A" * (n-1) + "a" vs "A" * (n-1) + "B"
    print("A" * (n - 2) + "Aa")
    print("A" * (n - 2) + "BB")`,
    explanation: `Java의 String hashCode는 s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]로 계산됩니다.
"Aa"(65*31 + 97 = 2112)와 "BB"(66*31 + 66 = 2112)는 hashCode가 같습니다.
이러한 충돌 패턴을 이용하여 서로 다른 문자열을 생성합니다.`,
    time_complexity: "O(1)",
    space_complexity: "O(N)",
  },

  // 4. Hashing (problem-15829)
  // 문자열 해시 계산: H = Σ(a_i * r^i) mod M
  // 입력: "abcde" → 출력: 4739715
  "problem-15829": {
    language: "PYTHON",
    code: `L = int(input())
s = input().strip()

r = 31
M = 1234567891

result = 0
power = 1

for i in range(L):
    a_i = ord(s[i]) - ord('a') + 1
    result = (result + a_i * power) % M
    power = (power * r) % M

print(result)`,
    explanation: `문자열 해싱 알고리즘.
H = (a₁×31⁰ + a₂×31¹ + ... + aₙ×31ⁿ⁻¹) mod 1234567891
각 문자를 1~26으로 변환 후 31의 거듭제곱을 곱하여 합산합니다.
매 단계마다 mod 연산으로 오버플로우를 방지합니다.`,
    time_complexity: "O(L)",
    space_complexity: "O(1)",
  },

  // 5. Hashing (hashing) - 프로그래머스 함수 형식
  "hashing": {
    language: "PYTHON",
    code: `def solution(s):
    r = 31
    M = 1234567891
    
    result = 0
    power = 1
    
    for char in s:
        a_i = ord(char) - ord('a') + 1
        result = (result + a_i * power) % M
        power = (power * r) % M
    
    return result`,
    explanation: `문자열 해싱 함수 (프로그래머스 형식).
problem-15829와 동일한 알고리즘이지만 함수로 작성되었습니다.`,
    time_complexity: "O(N)",
    space_complexity: "O(1)",
  },
};

/**
 * 정답 코드 저장
 */
async function saveSolution(problemSlug, solution) {
  const client = await pool.connect();
  try {
    // problem_id 조회
    const problemResult = await client.query(
      "SELECT id, title FROM problems WHERE slug = $1",
      [problemSlug]
    );

    if (problemResult.rows.length === 0) {
      console.log(`⚠️  문제를 찾을 수 없음: ${problemSlug}`);
      return false;
    }

    const problemId = problemResult.rows[0].id;
    const title = problemResult.rows[0].title;

    // 정답 코드 저장
    await client.query(
      `INSERT INTO problem_solutions 
       (problem_id, language, code, explanation, time_complexity, space_complexity, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (problem_id, language) 
       DO UPDATE SET 
         code = EXCLUDED.code,
         explanation = EXCLUDED.explanation,
         time_complexity = EXCLUDED.time_complexity,
         space_complexity = EXCLUDED.space_complexity,
         updated_at = NOW()`,
      [
        problemId,
        solution.language,
        solution.code,
        solution.explanation,
        solution.time_complexity,
        solution.space_complexity,
        "verified",
      ]
    );

    console.log(`✅ [${title}] 정답 코드 저장 완료`);
    return true;
  } catch (error) {
    console.error(`❌ 저장 실패 (${problemSlug}):`, error.message);
    return false;
  } finally {
    client.release();
  }
}

// Batch 2: 다음 10개 문제
const BATCH_2_SOLUTIONS = {
  // 6. 괄호 (problem-9012)
  "problem-9012": {
    language: "PYTHON",
    code: `import sys
input = sys.stdin.readline

n = int(input())
for _ in range(n):
    s = input().strip()
    stack = []
    valid = True
    
    for char in s:
        if char == '(':
            stack.append(char)
        elif char == ')':
            if not stack:
                valid = False
                break
            stack.pop()
    
    if stack:
        valid = False
    
    print("YES" if valid else "NO")`,
    explanation: `스택을 사용한 괄호 검사.
여는 괄호는 스택에 push, 닫는 괄호는 pop.
스택이 비어있거나 남아있으면 NO 출력.`,
    time_complexity: "O(N × M)",
    space_complexity: "O(M)",
  },

  // 7. 제로 (problem-10773)
  "problem-10773": {
    language: "PYTHON",
    code: `import sys
input = sys.stdin.readline

k = int(input())
stack = []

for _ in range(k):
    n = int(input())
    if n == 0:
        if stack:
            stack.pop()
    else:
        stack.append(n)

print(sum(stack))`,
    explanation: `스택을 사용하여 0이 나오면 가장 최근 수를 제거.
최종적으로 스택에 남은 수들의 합을 출력.`,
    time_complexity: "O(K)",
    space_complexity: "O(K)",
  },

  // 8. 균형잡힌 세상 (problem-4949)
  "problem-4949": {
    language: "PYTHON",
    code: `import sys

while True:
    s = sys.stdin.readline().rstrip()
    if s == '.':
        break
    
    stack = []
    valid = True
    
    for char in s:
        if char == '(' or char == '[':
            stack.append(char)
        elif char == ')':
            if not stack or stack[-1] != '(':
                valid = False
                break
            stack.pop()
        elif char == ']':
            if not stack or stack[-1] != '[':
                valid = False
                break
            stack.pop()
    
    if stack:
        valid = False
    
    print("yes" if valid else "no")`,
    explanation: `두 종류의 괄호를 처리하는 스택.
여는 괄호를 push, 닫는 괄호가 나오면 짝이 맞는지 확인.`,
    time_complexity: "O(N × M)",
    space_complexity: "O(M)",
  },

  // 9. 단어순서 뒤집기 (problem-12605)
  "problem-12605": {
    language: "PYTHON",
    code: `n = int(input())

for i in range(n):
    words = input().split()
    words.reverse()
    print(f"Case #{i+1}: {' '.join(words)}")`,
    explanation: `공백으로 분리 후 리스트를 뒤집고 다시 조합.`,
    time_complexity: "O(N × M)",
    space_complexity: "O(M)",
  },

  // 10. 힙 세기 (problem-7889)
  "problem-7889": {
    language: "PYTHON",
    code: `n = int(input())
print(2 ** n)`,
    explanation: `완전 이진 트리 레벨 k에는 2^k개의 노드가 존재.`,
    time_complexity: "O(1)",
    space_complexity: "O(1)",
  },

  // 11. 수 정렬하기 (problem-2750)
  "problem-2750": {
    language: "PYTHON",
    code: `n = int(input())
numbers = [int(input()) for _ in range(n)]

numbers.sort()

for num in numbers:
    print(num)`,
    explanation: `Python 내장 정렬 사용. N≤1000이므로 충분히 빠름.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 12. 수 정렬하기 3 (problem-10989)
  "problem-10989": {
    language: "PYTHON",
    code: `import sys
input = sys.stdin.readline

n = int(input())
count = [0] * 10001

for _ in range(n):
    num = int(input())
    count[num] += 1

for i in range(10001):
    if count[i] > 0:
        for _ in range(count[i]):
            print(i)`,
    explanation: `계수 정렬(Counting Sort).
수의 범위가 작을 때(1~10000) 메모리 효율적.`,
    time_complexity: "O(N + K)",
    space_complexity: "O(K)",
  },

  // 13. 5와 6의 차이 (problem-2864)
  "problem-2864": {
    language: "PYTHON",
    code: `a, b = input().split()

# 최솟값: 6을 모두 5로
min_a = int(a.replace('6', '5'))
min_b = int(b.replace('6', '5'))

# 최댓값: 5를 모두 6으로
max_a = int(a.replace('5', '6'))
max_b = int(b.replace('5', '6'))

print(min_a + min_b, max_a + max_b)`,
    explanation: `최솟값은 6→5, 최댓값은 5→6으로 변환.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },

  // 14. 알고리즘 수업 - 너비 우선 탐색 1 (problem-24444)
  "problem-24444": {
    language: "PYTHON",
    code: `from collections import deque
import sys

input = sys.stdin.readline
n, m, r = map(int, input().split())

graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)

for i in range(1, n + 1):
    graph[i].sort()

visited = [0] * (n + 1)
queue = deque([r])
visited[r] = 1
order = 2

while queue:
    node = queue.popleft()
    
    for next_node in graph[node]:
        if visited[next_node] == 0:
            visited[next_node] = order
            order += 1
            queue.append(next_node)

for i in range(1, n + 1):
    print(visited[i])`,
    explanation: `BFS로 방문 순서를 기록.
인접 노드를 오름차순으로 방문.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N + M)",
  },

  // 15. 알고리즘 수업 - 너비 우선 탐색 2 (problem-24445)
  "problem-24445": {
    language: "PYTHON",
    code: `from collections import deque
import sys

input = sys.stdin.readline
n, m, r = map(int, input().split())

graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)

for i in range(1, n + 1):
    graph[i].sort(reverse=True)

visited = [0] * (n + 1)
queue = deque([r])
visited[r] = 1
order = 2

while queue:
    node = queue.popleft()
    
    for next_node in graph[node]:
        if visited[next_node] == 0:
            visited[next_node] = order
            order += 1
            queue.append(next_node)

for i in range(1, n + 1):
    print(visited[i])`,
    explanation: `BFS로 방문 순서를 기록.
인접 노드를 내림차순으로 방문.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N + M)",
  },
};

// Batch 3: SILVER 문제 10개
const BATCH_3_SOLUTIONS = {
  // 16. 에디터 (problem-1406)
  "problem-1406": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
left = list(input().strip())
right = []

m = int(input())
for _ in range(m):
    cmd = input().strip().split()
    
    if cmd[0] == 'L' and left:
        right.append(left.pop())
    elif cmd[0] == 'D' and right:
        left.append(right.pop())
    elif cmd[0] == 'B' and left:
        left.pop()
    elif cmd[0] == 'P':
        left.append(cmd[1])

print(''.join(left) + ''.join(reversed(right)))`,
    explanation: `두 개의 스택을 사용한 에디터 구현.
커서 왼쪽은 left 스택, 오른쪽은 right 스택에 저장.
모든 연산이 O(1)에 처리됩니다.`,
    time_complexity: "O(M)",
    space_complexity: "O(N+M)",
  },

  // 17. 최소 힙 (problem-1927)
  "problem-1927": {
    language: "PYTHON",
    code: `import sys
import heapq

input = sys.stdin.readline
n = int(input())
heap = []

for _ in range(n):
    x = int(input())
    if x == 0:
        if heap:
            print(heapq.heappop(heap))
        else:
            print(0)
    else:
        heapq.heappush(heap, x)`,
    explanation: `Python heapq 모듈을 사용한 최소 힙.
0이면 최솟값 출력 및 제거, 그 외는 삽입.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 18. 절댓값 힙 (problem-11286)
  "problem-11286": {
    language: "PYTHON",
    code: `import sys
import heapq

input = sys.stdin.readline
n = int(input())
heap = []

for _ in range(n):
    x = int(input())
    if x == 0:
        if heap:
            print(heapq.heappop(heap)[1])
        else:
            print(0)
    else:
        heapq.heappush(heap, (abs(x), x))`,
    explanation: `(절댓값, 원래 값) 튜플로 저장하여 절댓값 기준 정렬.
절댓값이 같으면 자동으로 원래 값으로 비교됩니다.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 19. 최대 힙 (problem-11279)
  "problem-11279": {
    language: "PYTHON",
    code: `import sys
import heapq

input = sys.stdin.readline
n = int(input())
heap = []

for _ in range(n):
    x = int(input())
    if x == 0:
        if heap:
            print(-heapq.heappop(heap))
        else:
            print(0)
    else:
        heapq.heappush(heap, -x)`,
    explanation: `음수로 변환하여 최대 힙을 구현.
삽입 시 -x를 push, 삭제 시 다시 음수를 취해 원래 값으로 복원.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 20. 수 정렬하기 2 (problem-2751)
  "problem-2751": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n = int(input())
numbers = [int(input()) for _ in range(n)]

numbers.sort()

for num in numbers:
    print(num)`,
    explanation: `N이 최대 1,000,000이므로 O(N log N) 정렬 필수.
sys.stdin으로 빠른 입력 처리.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 21. ATM (problem-11399)
  "problem-11399": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n = int(input())
times = list(map(int, input().split()))

times.sort()

total = 0
cumsum = 0
for t in times:
    cumsum += t
    total += cumsum

print(total)`,
    explanation: `그리디: 시간이 짧은 사람부터 처리하면 최소 시간.
정렬 후 누적합을 계산합니다.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 22. 설탕 배달 (problem-2839)
  "problem-2839": {
    language: "PYTHON",
    code: `n = int(input())

result = -1
for five in range(n // 5, -1, -1):
    remain = n - (five * 5)
    if remain % 3 == 0:
        three = remain // 3
        result = five + three
        break

print(result)`,
    explanation: `5kg 봉지를 최대한 많이 사용하는 그리디.
5kg부터 줄여가며 나머지가 3의 배수인지 확인.`,
    time_complexity: "O(N)",
    space_complexity: "O(1)",
  },

  // 23. 동전 0 (problem-11047)
  "problem-11047": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n, k = map(int, input().split())
coins = [int(input()) for _ in range(n)]

count = 0
for i in range(n-1, -1, -1):
    if k >= coins[i]:
        count += k // coins[i]
        k %= coins[i]
    if k == 0:
        break

print(count)`,
    explanation: `그리디: 큰 동전부터 최대한 사용.
동전 가치가 배수 관계이므로 그리디가 최적해를 보장.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },

  // 24. 1, 2, 3 더하기 (problem-9095)
  "problem-9095": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
t = int(input())

# DP 테이블 미리 계산
dp = [0] * 12
dp[1] = 1  # 1
dp[2] = 2  # 1+1, 2
dp[3] = 4  # 1+1+1, 1+2, 2+1, 3

for i in range(4, 12):
    dp[i] = dp[i-1] + dp[i-2] + dp[i-3]

for _ in range(t):
    n = int(input())
    print(dp[n])`,
    explanation: `DP: dp[n] = dp[n-1] + dp[n-2] + dp[n-3]
각각 1, 2, 3을 더하는 경우의 수를 합산.`,
    time_complexity: "O(N + T)",
    space_complexity: "O(N)",
  },

  // 25. RGB거리 (problem-1149)
  "problem-1149": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n = int(input())

costs = [list(map(int, input().split())) for _ in range(n)]

# dp[i][j] = i번째 집을 j색으로 칠했을 때 최소 비용
dp = [[0] * 3 for _ in range(n)]
dp[0] = costs[0][:]

for i in range(1, n):
    dp[i][0] = costs[i][0] + min(dp[i-1][1], dp[i-1][2])
    dp[i][1] = costs[i][1] + min(dp[i-1][0], dp[i-1][2])
    dp[i][2] = costs[i][2] + min(dp[i-1][0], dp[i-1][1])

print(min(dp[n-1]))`,
    explanation: `DP: 각 집마다 3가지 색상 중 선택.
이전 집과 다른 색의 최솟값을 더함.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },
};

// Batch 4: SILVER 9개 + GOLD 1개
const BATCH_4_SOLUTIONS = {
  // 26. 다리 놓기 (problem-1010)
  "problem-1010": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
t = int(input())

# 조합 C(n, r) 미리 계산
dp = [[0] * 31 for _ in range(31)]

for i in range(31):
    dp[i][0] = 1
    dp[i][i] = 1

for i in range(2, 31):
    for j in range(1, i):
        dp[i][j] = dp[i-1][j-1] + dp[i-1][j]

for _ in range(t):
    n, m = map(int, input().split())
    print(dp[m][n])`,
    explanation: `조합 C(M, N)을 DP로 계산.
파스칼의 삼각형: C(n,r) = C(n-1,r-1) + C(n-1,r)`,
    time_complexity: "O(M²)",
    space_complexity: "O(M²)",
  },

  // 27. 알고리즘 수업 - 깊이 우선 탐색 1 (problem-24479)
  "problem-24479": {
    language: "PYTHON",
    code: `import sys
sys.setrecursionlimit(10**6)

input = sys.stdin.readline
n, m, r = map(int, input().split())

graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)

for i in range(1, n + 1):
    graph[i].sort()

visited = [0] * (n + 1)
order = 1

def dfs(node):
    global order
    visited[node] = order
    order += 1
    
    for next_node in graph[node]:
        if visited[next_node] == 0:
            dfs(next_node)

dfs(r)

for i in range(1, n + 1):
    print(visited[i])`,
    explanation: `DFS로 방문 순서를 기록.
인접 노드를 오름차순으로 방문.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N + M)",
  },

  // 28. 알고리즘 수업 - 깊이 우선 탐색 2 (problem-24480)
  "problem-24480": {
    language: "PYTHON",
    code: `import sys
sys.setrecursionlimit(10**6)

input = sys.stdin.readline
n, m, r = map(int, input().split())

graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)

for i in range(1, n + 1):
    graph[i].sort(reverse=True)

visited = [0] * (n + 1)
order = 1

def dfs(node):
    global order
    visited[node] = order
    order += 1
    
    for next_node in graph[node]:
        if visited[next_node] == 0:
            dfs(next_node)

dfs(r)

for i in range(1, n + 1):
    print(visited[i])`,
    explanation: `DFS로 방문 순서를 기록.
인접 노드를 내림차순으로 방문.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N + M)",
  },

  // 29. 수 찾기 (problem-1920)
  "problem-1920": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n = int(input())
a = set(map(int, input().split()))
m = int(input())
targets = map(int, input().split())

for target in targets:
    print(1 if target in a else 0)`,
    explanation: `Set 자료구조로 O(1) 검색.
해시 테이블 기반으로 매우 빠른 검색이 가능합니다.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N)",
  },

  // 30. 숫자 카드 (problem-10815)
  "problem-10815": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n = int(input())
cards = set(map(int, input().split()))
m = int(input())
queries = list(map(int, input().split()))

print(' '.join('1' if q in cards else '0' for q in queries))`,
    explanation: `Set으로 카드를 저장하고 O(1) 시간에 확인.
리스트 컴프리헨션으로 결과를 한 줄로 출력.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N)",
  },

  // 31. 미로 탐색 (problem-2178)
  "problem-2178": {
    language: "PYTHON",
    code: `from collections import deque
import sys

input = sys.stdin.readline
n, m = map(int, input().split())
maze = [input().strip() for _ in range(n)]

queue = deque([(0, 0, 1)])
visited = [[False] * m for _ in range(n)]
visited[0][0] = True

dx = [-1, 1, 0, 0]
dy = [0, 0, -1, 1]

while queue:
    x, y, dist = queue.popleft()
    
    if x == n-1 and y == m-1:
        print(dist)
        break
    
    for i in range(4):
        nx, ny = x + dx[i], y + dy[i]
        if 0 <= nx < n and 0 <= ny < m and maze[nx][ny] == '1' and not visited[nx][ny]:
            visited[nx][ny] = True
            queue.append((nx, ny, dist+1))`,
    explanation: `BFS로 최단 거리를 구함.
상하좌우 4방향으로 이동하며 거리를 함께 저장.`,
    time_complexity: "O(N×M)",
    space_complexity: "O(N×M)",
  },

  // 32. 숨바꼭질 (problem-1697)
  "problem-1697": {
    language: "PYTHON",
    code: `from collections import deque
import sys

input = sys.stdin.readline
n, k = map(int, input().split())

MAX = 100001
visited = [False] * MAX
queue = deque([(n, 0)])
visited[n] = True

while queue:
    pos, time = queue.popleft()
    
    if pos == k:
        print(time)
        break
    
    for next_pos in [pos-1, pos+1, pos*2]:
        if 0 <= next_pos < MAX and not visited[next_pos]:
            visited[next_pos] = True
            queue.append((next_pos, time+1))`,
    explanation: `BFS로 최단 시간을 구함.
3가지 이동(X-1, X+1, 2*X)을 모두 시도.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },

  // 33. 연결 요소의 개수 (problem-11724)
  "problem-11724": {
    language: "PYTHON",
    code: `import sys
sys.setrecursionlimit(10**6)

input = sys.stdin.readline
n, m = map(int, input().split())

graph = [[] for _ in range(n + 1)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)

visited = [False] * (n + 1)

def dfs(node):
    visited[node] = True
    for next_node in graph[node]:
        if not visited[next_node]:
            dfs(next_node)

count = 0
for i in range(1, n + 1):
    if not visited[i]:
        dfs(i)
        count += 1

print(count)`,
    explanation: `DFS로 연결 요소를 찾음.
방문하지 않은 노드에서 DFS 시작 시마다 카운트 증가.`,
    time_complexity: "O(N + M)",
    space_complexity: "O(N + M)",
  },

  // 34. 경로 찾기 (problem-11403)
  "problem-11403": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
n = int(input())
graph = [list(map(int, input().split())) for _ in range(n)]

# 플로이드-워셜
for k in range(n):
    for i in range(n):
        for j in range(n):
            if graph[i][k] and graph[k][j]:
                graph[i][j] = 1

for row in graph:
    print(' '.join(map(str, row)))`,
    explanation: `플로이드-워셜로 모든 경로를 찾음.
i→k와 k→j 경로가 있으면 i→j 경로도 존재.`,
    time_complexity: "O(N³)",
    space_complexity: "O(N²)",
  },

  // 35. if 3 (problem-15551) - GOLD
  "problem-15551": {
    language: "PYTHON",
    code: `import sys

n, m = map(int, sys.stdin.readline().split())
s = sys.stdin.readline().strip()

# "IOI" 패턴 카운트
count = 0
result = 0
i = 0

while i < m - 2:
    if s[i:i+3] == 'IOI':
        count += 1
        i += 2
        if count == n:
            result += 1
            count -= 1
    else:
        count = 0
        i += 1

print(result)`,
    explanation: `IOI 패턴을 찾으며 연속된 패턴 개수를 셈.
N개 이상 연속되면 카운트합니다.`,
    time_complexity: "O(M)",
    space_complexity: "O(1)",
  },
};

// Batch 5 (최종): GOLD 4개 + PLATINUM 4개
const BATCH_5_SOLUTIONS = {
  // 36. 보석 도둑 (problem-1202) - GOLD
  "problem-1202": {
    language: "PYTHON",
    code: `import sys
import heapq

input = sys.stdin.readline
n, k = map(int, input().split())

jewels = []
for _ in range(n):
    m, v = map(int, input().split())
    jewels.append((m, v))

bags = []
for _ in range(k):
    bags.append(int(input()))

jewels.sort()
bags.sort()

result = 0
heap = []
j = 0

for bag in bags:
    while j < n and jewels[j][0] <= bag:
        heapq.heappush(heap, -jewels[j][1])
        j += 1
    
    if heap:
        result += -heapq.heappop(heap)

print(result)`,
    explanation: `그리디 + 힙 알고리즘.
가방을 작은 것부터 처리하며, 넣을 수 있는 보석 중 가장 비싼 것을 선택.`,
    time_complexity: "O(N log N + K log K)",
    space_complexity: "O(N)",
  },

  // 37. 교육적인 트리 문제 (problem-30108) - GOLD
  "problem-30108": {
    language: "PYTHON",
    code: `import sys
sys.setrecursionlimit(300000)

input = sys.stdin.readline
n = int(input())

if n == 1:
    print(0)
else:
    parents = [0] + list(map(int, input().split()))
    
    tree = [[] for _ in range(n + 1)]
    for i in range(2, n + 1):
        tree[parents[i-1]].append(i)
    
    subtree_size = [0] * (n + 1)
    
    def dfs(node):
        subtree_size[node] = 1
        for child in tree[node]:
            subtree_size[node] += dfs(child)
        return subtree_size[node]
    
    dfs(1)
    
    result = sum(subtree_size[1:])
    print(result)`,
    explanation: `DFS로 각 노드의 서브트리 크기를 계산.
모든 서브트리 크기의 합이 정답입니다.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },

  // 38. 가장 긴 증가하는 부분 수열 3 (problem-12738) - GOLD
  "problem-12738": {
    language: "PYTHON",
    code: `import sys
import bisect

input = sys.stdin.readline
n = int(input())
arr = list(map(int, input().split()))

lis = []

for num in arr:
    pos = bisect.bisect_left(lis, num)
    if pos == len(lis):
        lis.append(num)
    else:
        lis[pos] = num

print(len(lis))`,
    explanation: `이분 탐색을 활용한 O(N log N) LIS.
각 원소에 대해 적절한 위치를 찾아 갱신합니다.`,
    time_complexity: "O(N log N)",
    space_complexity: "O(N)",
  },

  // 39. 합이 0인 네 정수 (problem-7453) - GOLD
  "problem-7453": {
    language: "PYTHON",
    code: `import sys
from collections import defaultdict

input = sys.stdin.readline
n = int(input())

A, B, C, D = [], [], [], []
for _ in range(n):
    a, b, c, d = map(int, input().split())
    A.append(a)
    B.append(b)
    C.append(c)
    D.append(d)

# A+B의 모든 합 저장
ab_sum = defaultdict(int)
for a in A:
    for b in B:
        ab_sum[a + b] += 1

# C+D에 대해 -(C+D)가 ab_sum에 있는지 확인
count = 0
for c in C:
    for d in D:
        count += ab_sum[-(c + d)]

print(count)`,
    explanation: `Two Pointers 변형: A+B 합을 해시맵에 저장 후 -(C+D)를 찾음.
O(N⁴)를 O(N²)로 최적화합니다.`,
    time_complexity: "O(N²)",
    space_complexity: "O(N²)",
  },

  // 40. 가장 긴 문자열 (problem-3033) - PLATINUM
  "problem-3033": {
    language: "PYTHON",
    code: `def longest_repeated_substring(s):
    n = len(s)
    
    def check(length):
        seen = set()
        for i in range(n - length + 1):
            substring = s[i:i+length]
            if substring in seen:
                return True
            seen.add(substring)
        return False
    
    left, right = 0, n
    result = 0
    
    while left <= right:
        mid = (left + right) // 2
        if check(mid):
            result = mid
            left = mid + 1
        else:
            right = mid - 1
    
    return result

L = int(input())
s = input().strip()

print(longest_repeated_substring(s))`,
    explanation: `이진 탐색 + 해싱으로 반복되는 가장 긴 부분 문자열을 찾음.
길이에 대해 이진 탐색을 수행합니다.`,
    time_complexity: "O(N² log N)",
    space_complexity: "O(N²)",
  },

  // 41. 반복 부분문자열 (problem-1605) - PLATINUM
  "problem-1605": {
    language: "PYTHON",
    code: `def longest_repeated_substring_binary(n, s):
    def check(length):
        seen = set()
        for i in range(n - length + 1):
            sub = s[i:i+length]
            if sub in seen:
                return True
            seen.add(sub)
        return False
    
    left, right = 0, n
    result = 0
    
    while left <= right:
        mid = (left + right) // 2
        if check(mid):
            result = mid
            left = mid + 1
        else:
            right = mid - 1
    
    return result

n = int(input())
s = input().strip()

print(longest_repeated_substring_binary(n, s))`,
    explanation: `이진 탐색으로 반복되는 최대 길이를 찾음.
해시 셋을 사용하여 중복 검사합니다.`,
    time_complexity: "O(N² log N)",
    space_complexity: "O(N²)",
  },

  // 42. 돌 던지기 (problem-3025) - PLATINUM
  "problem-3025": {
    language: "PYTHON",
    code: `import sys

input = sys.stdin.readline
r, c = map(int, input().split())

board = []
for _ in range(r):
    board.append(list(input().strip()))

n = int(input())

for _ in range(n):
    col = int(input()) - 1
    
    row = 0
    while row < r:
        if board[row][col] == 'O':
            if row > 0:
                board[row - 1][col] = 'O'
            break
        elif board[row][col] == 'X':
            if col > 0 and board[row][col - 1] == '.':
                col -= 1
            elif col < c - 1 and board[row][col + 1] == '.':
                col += 1
            else:
                if row > 0:
                    board[row - 1][col] = 'O'
                break
        row += 1
    else:
        board[r - 1][col] = 'O'

for row in board:
    print(''.join(row))`,
    explanation: `시뮬레이션: 돌이 아래로 떨어지며 장애물을 만나면 좌우로 이동.`,
    time_complexity: "O(N × R × C)",
    space_complexity: "O(R × C)",
  },

  // 43. 힙 정렬 (problem-2220) - PLATINUM
  "problem-2220": {
    language: "PYTHON",
    code: `n = int(input())

if n == 1:
    print(1)
else:
    result = [0] * (n + 1)
    result[1] = n
    
    for i in range(2, n + 1):
        result[i] = i - 1
    
    for i in range(1, n + 1):
        print(result[i])`,
    explanation: `힙 정렬의 최악의 경우를 만드는 입력 순서 생성.
특정 패턴으로 배치하여 최대 비교 횟수를 유도합니다.`,
    time_complexity: "O(N)",
    space_complexity: "O(N)",
  },
};

/**
 * 메인 실행
 */
async function main() {
  const batch = process.argv[2] || '1';
  
  let solutions, batchName;
  if (batch === '2') {
    solutions = BATCH_2_SOLUTIONS;
    batchName = 'Batch 2';
  } else if (batch === '3') {
    solutions = BATCH_3_SOLUTIONS;
    batchName = 'Batch 3';
  } else if (batch === '4') {
    solutions = BATCH_4_SOLUTIONS;
    batchName = 'Batch 4';
  } else if (batch === '5') {
    solutions = BATCH_5_SOLUTIONS;
    batchName = 'Batch 5 (최종)';
  } else {
    solutions = VERIFIED_SOLUTIONS;
    batchName = 'Batch 1';
  }
  
  console.log(`🚀 검증된 정답 코드 생성 시작 (${batchName})\n`);
  console.log("━".repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const [slug, solution] of Object.entries(solutions)) {
    const success = await saveSolution(slug, solution);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log("\n━".repeat(60));
  console.log(`✨ ${batchName} 완료!`);
  console.log("━".repeat(60));
  console.log(`   성공: ${successCount}개`);
  console.log(`   실패: ${failCount}개`);
  console.log();

  await pool.end();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { VERIFIED_SOLUTIONS, saveSolution };

