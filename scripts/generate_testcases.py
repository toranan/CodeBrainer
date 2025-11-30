#!/usr/bin/env python3
"""
각 문제별로 정답 로직을 구현하여 테스트케이스를 5개로 채우는 스크립트
"""

import os
import random
import psycopg2

SUPABASE_URL = "postgresql://postgres.sqwobsmtrgjuhgymfwtl:qpwoe1234@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
STORAGE_DIR = "/app/backend/orchestrator/storage/problems"

# ========== 각 문제별 정답 로직 구현 ==========

def solve_problem_2178(input_data):
    """미로 탐색 - BFS"""
    from collections import deque
    lines = input_data.strip().split('\n')
    n, m = map(int, lines[0].split())
    maze = [lines[i+1] for i in range(n)]
    dist = [[-1] * m for _ in range(n)]
    dist[0][0] = 1
    q = deque([(0, 0)])
    dx, dy = [0, 0, 1, -1], [1, -1, 0, 0]
    while q:
        x, y = q.popleft()
        for i in range(4):
            nx, ny = x + dx[i], y + dy[i]
            if 0 <= nx < n and 0 <= ny < m and maze[nx][ny] == '1' and dist[nx][ny] == -1:
                dist[nx][ny] = dist[x][y] + 1
                q.append((nx, ny))
    return str(dist[n-1][m-1])

def solve_problem_1697(input_data):
    """숨바꼭질 - BFS"""
    from collections import deque
    n, k = map(int, input_data.strip().split())
    if n >= k:
        return str(n - k)
    MAX = 100001
    dist = [-1] * MAX
    dist[n] = 0
    q = deque([n])
    while q:
        x = q.popleft()
        if x == k:
            return str(dist[x])
        for nx in [x-1, x+1, x*2]:
            if 0 <= nx < MAX and dist[nx] == -1:
                dist[nx] = dist[x] + 1
                q.append(nx)
    return str(dist[k])

def solve_problem_11403(input_data):
    """경로 찾기 - Floyd-Warshall"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    adj = [list(map(int, lines[i+1].split())) for i in range(n)]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if adj[i][k] and adj[k][j]:
                    adj[i][j] = 1
    return '\n'.join(' '.join(map(str, row)) for row in adj)

def solve_problem_11724(input_data):
    """연결 요소의 개수"""
    lines = input_data.strip().split('\n')
    n, m = map(int, lines[0].split())
    adj = [[] for _ in range(n + 1)]
    for i in range(1, m + 1):
        u, v = map(int, lines[i].split())
        adj[u].append(v)
        adj[v].append(u)
    visited = [False] * (n + 1)
    count = 0
    for i in range(1, n + 1):
        if not visited[i]:
            stack = [i]
            visited[i] = True
            while stack:
                curr = stack.pop()
                for nxt in adj[curr]:
                    if not visited[nxt]:
                        visited[nxt] = True
                        stack.append(nxt)
            count += 1
    return str(count)

def solve_problem_24444(input_data):
    """BFS 1 - 오름차순"""
    from collections import deque
    lines = input_data.strip().split('\n')
    n, m, r = map(int, lines[0].split())
    adj = [[] for _ in range(n + 1)]
    for i in range(1, m + 1):
        u, v = map(int, lines[i].split())
        adj[u].append(v)
        adj[v].append(u)
    for i in range(n + 1):
        adj[i].sort()
    order = [0] * (n + 1)
    visited = [False] * (n + 1)
    cnt = 1
    q = deque([r])
    visited[r] = True
    order[r] = cnt
    cnt += 1
    while q:
        u = q.popleft()
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                order[v] = cnt
                cnt += 1
                q.append(v)
    return '\n'.join(map(str, order[1:]))

def solve_problem_24445(input_data):
    """BFS 2 - 내림차순"""
    from collections import deque
    lines = input_data.strip().split('\n')
    n, m, r = map(int, lines[0].split())
    adj = [[] for _ in range(n + 1)]
    for i in range(1, m + 1):
        u, v = map(int, lines[i].split())
        adj[u].append(v)
        adj[v].append(u)
    for i in range(n + 1):
        adj[i].sort(reverse=True)
    order = [0] * (n + 1)
    visited = [False] * (n + 1)
    cnt = 1
    q = deque([r])
    visited[r] = True
    order[r] = cnt
    cnt += 1
    while q:
        u = q.popleft()
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                order[v] = cnt
                cnt += 1
                q.append(v)
    return '\n'.join(map(str, order[1:]))

def solve_problem_24479(input_data):
    """DFS 1 - 오름차순"""
    lines = input_data.strip().split('\n')
    n, m, r = map(int, lines[0].split())
    adj = [[] for _ in range(n + 1)]
    for i in range(1, m + 1):
        u, v = map(int, lines[i].split())
        adj[u].append(v)
        adj[v].append(u)
    for i in range(n + 1):
        adj[i].sort()
    order = [0] * (n + 1)
    visited = [False] * (n + 1)
    cnt = [1]
    def dfs(u):
        visited[u] = True
        order[u] = cnt[0]
        cnt[0] += 1
        for v in adj[u]:
            if not visited[v]:
                dfs(v)
    import sys
    sys.setrecursionlimit(100001)
    dfs(r)
    return '\n'.join(map(str, order[1:]))

def solve_problem_24480(input_data):
    """DFS 2 - 내림차순"""
    lines = input_data.strip().split('\n')
    n, m, r = map(int, lines[0].split())
    adj = [[] for _ in range(n + 1)]
    for i in range(1, m + 1):
        u, v = map(int, lines[i].split())
        adj[u].append(v)
        adj[v].append(u)
    for i in range(n + 1):
        adj[i].sort(reverse=True)
    order = [0] * (n + 1)
    visited = [False] * (n + 1)
    cnt = [1]
    def dfs(u):
        visited[u] = True
        order[u] = cnt[0]
        cnt[0] += 1
        for v in adj[u]:
            if not visited[v]:
                dfs(v)
    import sys
    sys.setrecursionlimit(100001)
    dfs(r)
    return '\n'.join(map(str, order[1:]))

def solve_problem_2220(input_data):
    """힙 정렬 - 최대 Swap 힙 구성"""
    n = int(input_data.strip())
    if n == 1:
        return "1"
    heap = [0] * (n + 1)
    heap[1] = n
    for i in range(n - 1, 0, -1):
        heap[2] = i
        j = 2
        while 2 * j <= n:
            if 2 * j + 1 <= n and heap[2 * j + 1] > heap[2 * j]:
                heap[j], heap[2 * j + 1] = heap[2 * j + 1], heap[j]
                j = 2 * j + 1
            else:
                heap[j], heap[2 * j] = heap[2 * j], heap[j]
                j = 2 * j
    return ' '.join(map(str, heap[1:]))

def solve_problem_1605(input_data):
    """반복 부분문자열 - 3033과 동일"""
    return solve_problem_3033(input_data)

def solve_problem_3025(input_data):
    """돌 던지기 - 시뮬레이션"""
    lines = input_data.strip().split('\n')
    r, c = map(int, lines[0].split())
    board = [list(lines[i + 1]) for i in range(r)]
    n = int(lines[r + 1])
    throws = [int(lines[r + 2 + i]) - 1 for i in range(n)]  # 0-indexed

    for col in throws:
        row = 0
        # 돌이 떨어지는 시뮬레이션
        while row < r:
            # 아랫칸 확인
            if row == r - 1:
                # 가장 아랫줄
                board[row][col] = 'O'
                break
            elif board[row + 1][col] == 'X':
                # 벽으로 막힘
                board[row][col] = 'O'
                break
            elif board[row + 1][col] == '.':
                # 빈칸 - 아래로 이동
                row += 1
            elif board[row + 1][col] == 'O':
                # 돌이 있음 - 미끄러짐 시도
                # 왼쪽으로 미끄러지기
                if col > 0 and board[row][col - 1] == '.' and board[row + 1][col - 1] == '.':
                    col -= 1
                    row += 1
                # 오른쪽으로 미끄러지기
                elif col < c - 1 and board[row][col + 1] == '.' and board[row + 1][col + 1] == '.':
                    col += 1
                    row += 1
                else:
                    # 멈춤
                    board[row][col] = 'O'
                    break
            else:
                break

    return '\n'.join(''.join(row) for row in board)

def solve_problem_7889(input_data):
    """힙 세기 - 트리 DP + 조합론"""
    from math import factorial

    lines = input_data.strip().split('\n')
    idx = 0
    results = []
    t = int(lines[idx])
    idx += 1

    for _ in range(t):
        n, m = map(int, lines[idx].split())
        idx += 1

        if n == 1:
            results.append("1")
            continue

        # 부모 정보 파싱
        parent = [0] * (n + 1)
        children = [[] for _ in range(n + 1)]
        for i in range(2, n + 1):
            parent[i] = int(lines[idx])
            children[parent[i]].append(i)
            idx += 1

        # 서브트리 크기 계산
        subtree_size = [0] * (n + 1)

        def calc_size(v):
            subtree_size[v] = 1
            for child in children[v]:
                calc_size(child)
                subtree_size[v] += subtree_size[child]

        calc_size(1)

        # DP로 힙 개수 계산
        # dp[v] = v를 루트로 하는 서브트리에서 힙 번호 매기는 방법 수
        # dp[v] = (size[v]-1)! / (size[c1]! * size[c2]! * ...) * prod(dp[c])
        # = C(size[v]-1, size[c1]) * C(size[v]-1-size[c1], size[c2]) * ... * prod(dp[c])

        def mod_inverse(a, mod):
            return pow(a, mod - 2, mod) if mod > 1 else 0

        def calc_dp(v):
            if not children[v]:
                return 1

            result = 1
            remaining = subtree_size[v] - 1

            for child in children[v]:
                child_size = subtree_size[child]
                # C(remaining, child_size)
                numer = 1
                denom = 1
                for i in range(child_size):
                    numer = (numer * (remaining - i)) % m
                    denom = (denom * (i + 1)) % m

                if m > 1:
                    comb = (numer * mod_inverse(denom, m)) % m
                else:
                    comb = 0

                result = (result * comb) % m
                result = (result * calc_dp(child)) % m
                remaining -= child_size

            return result

        results.append(str(calc_dp(1)))

    return '\n'.join(results)

def solve_problem_30108(input_data):
    """교육적인 트리 문제 - 그리디"""
    import heapq
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    parents = [0, 0] + list(map(int, lines[1].split()))  # 1-indexed
    values = [0] + list(map(int, lines[2].split()))
    children = [[] for _ in range(n + 1)]
    for i in range(2, n + 1):
        children[parents[i]].append(i)
    results = []
    heap = [(-values[1], 1)]
    total = 0
    for _ in range(n):
        neg_val, node = heapq.heappop(heap)
        total += -neg_val
        results.append(str(total))
        for child in children[node]:
            heapq.heappush(heap, (-values[child], child))
    return '\n'.join(results)

def solve_problem_12738(input_data):
    """LIS 3 - 이분탐색 O(nlogn)"""
    import bisect
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    arr = list(map(int, lines[1].split()))
    dp = []
    for x in arr:
        pos = bisect.bisect_left(dp, x)
        if pos == len(dp):
            dp.append(x)
        else:
            dp[pos] = x
    return str(len(dp))

def solve_problem_3033(input_data):
    """가장 긴 문자열 - 이분탐색 + 해싱"""
    lines = input_data.strip().split('\n')
    L = int(lines[0])
    s = lines[1]

    def has_duplicate(length):
        if length == 0:
            return True
        MOD = 10**9 + 7
        BASE = 31
        seen = set()
        h = 0
        power = 1
        for i in range(length):
            h = (h * BASE + ord(s[i])) % MOD
            if i < length - 1:
                power = (power * BASE) % MOD
        seen.add(h)
        for i in range(length, len(s)):
            h = (h - ord(s[i - length]) * power) % MOD
            h = (h * BASE + ord(s[i])) % MOD
            if h in seen:
                return True
            seen.add(h)
        return False

    left, right = 0, L - 1
    result = 0
    while left <= right:
        mid = (left + right) // 2
        if has_duplicate(mid):
            result = mid
            left = mid + 1
        else:
            right = mid - 1
    return str(result)

def solve_problem_7453(input_data):
    """합이 0인 네 정수 - Meet in the middle"""
    from collections import Counter
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    A, B, C, D = [], [], [], []
    for i in range(1, n + 1):
        a, b, c, d = map(int, lines[i].split())
        A.append(a)
        B.append(b)
        C.append(c)
        D.append(d)

    # A+B의 모든 합
    ab_sums = Counter()
    for a in A:
        for b in B:
            ab_sums[a + b] += 1

    # C+D의 합에서 -(A+B)인 것 찾기
    count = 0
    for c in C:
        for d in D:
            target = -(c + d)
            if target in ab_sums:
                count += ab_sums[target]

    return str(count)

def solve_problem_10773(input_data):
    """제로 - 스택 문제: 0이면 pop, 아니면 push, 최종 합계 출력"""
    lines = input_data.strip().split('\n')
    k = int(lines[0])
    stack = []
    for i in range(1, k + 1):
        n = int(lines[i])
        if n == 0:
            if stack:
                stack.pop()
        else:
            stack.append(n)
    return str(sum(stack))

def solve_problem_9012(input_data):
    """괄호 - 괄호 유효성 검사: YES/NO"""
    lines = input_data.strip().split('\n')
    t = int(lines[0])
    results = []
    for i in range(1, t + 1):
        s = lines[i]
        count = 0
        valid = True
        for c in s:
            if c == '(':
                count += 1
            elif c == ')':
                count -= 1
                if count < 0:
                    valid = False
                    break
        if count != 0:
            valid = False
        results.append("YES" if valid else "NO")
    return '\n'.join(results)

def solve_hashing(input_data):
    """Hashing - 문자열 해싱"""
    lines = input_data.strip().split('\n')
    L = int(lines[0])
    s = lines[1]
    M = 1234567891
    r = 31
    result = 0
    power = 1
    for c in s:
        result = (result + (ord(c) - ord('a') + 1) * power) % M
        power = (power * r) % M
    return str(result)

def solve_if3(input_data):
    """if 3 - 문자열에서 규칙 찾기"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    s = lines[1]

    # if 3 문제: 세 문자가 연속으로 같으면 해당 문자, 아니면 "F"
    for i in range(n - 2):
        if s[i] == s[i+1] == s[i+2]:
            return s[i]
    return "F"

def solve_problem_4949(input_data):
    """균형잡힌 세상 - 괄호와 대괄호 검사"""
    lines = input_data.strip().split('\n')
    results = []
    for line in lines:
        if line == '.':
            break
        stack = []
        valid = True
        for c in line:
            if c in '([':
                stack.append(c)
            elif c == ')':
                if not stack or stack[-1] != '(':
                    valid = False
                    break
                stack.pop()
            elif c == ']':
                if not stack or stack[-1] != '[':
                    valid = False
                    break
                stack.pop()
        if stack:
            valid = False
        results.append("yes" if valid else "no")
    return '\n'.join(results)

def solve_problem_1927(input_data):
    """최소 힙"""
    import heapq
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    heap = []
    results = []
    for i in range(1, n + 1):
        x = int(lines[i])
        if x == 0:
            if heap:
                results.append(str(heapq.heappop(heap)))
            else:
                results.append("0")
        else:
            heapq.heappush(heap, x)
    return '\n'.join(results)

def solve_problem_11286(input_data):
    """절댓값 힙"""
    import heapq
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    heap = []  # (abs, original)
    results = []
    for i in range(1, n + 1):
        x = int(lines[i])
        if x == 0:
            if heap:
                _, val = heapq.heappop(heap)
                results.append(str(val))
            else:
                results.append("0")
        else:
            heapq.heappush(heap, (abs(x), x))
    return '\n'.join(results)

def solve_problem_12605(input_data):
    """단어순서 뒤집기"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    results = []
    for i in range(1, n + 1):
        words = lines[i].split()
        results.append(f"Case #{i}: {' '.join(reversed(words))}")
    return '\n'.join(results)

def solve_problem_2864(input_data):
    """5와 6의 차이 - 최솟값과 최댓값"""
    a, b = input_data.strip().split()
    # 최솟값: 6을 5로 바꿈
    min_a = int(a.replace('6', '5'))
    min_b = int(b.replace('6', '5'))
    # 최댓값: 5를 6으로 바꿈
    max_a = int(a.replace('5', '6'))
    max_b = int(b.replace('5', '6'))
    return f"{min_a + min_b} {max_a + max_b}"

def solve_problem_11279(input_data):
    """최대 힙"""
    import heapq
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    heap = []  # 최대 힙은 음수로 저장
    results = []
    for i in range(1, n + 1):
        x = int(lines[i])
        if x == 0:
            if heap:
                results.append(str(-heapq.heappop(heap)))
            else:
                results.append("0")
        else:
            heapq.heappush(heap, -x)
    return '\n'.join(results)

def solve_problem_2750(input_data):
    """수 정렬하기"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    nums = [int(lines[i]) for i in range(1, n + 1)]
    nums.sort()
    return '\n'.join(map(str, nums))

def solve_problem_2751(input_data):
    """수 정렬하기 2"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    nums = [int(lines[i]) for i in range(1, n + 1)]
    nums.sort()
    return '\n'.join(map(str, nums))

def solve_problem_10989(input_data):
    """수 정렬하기 3 - 카운팅 정렬"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    nums = [int(lines[i]) for i in range(1, n + 1)]
    nums.sort()
    return '\n'.join(map(str, nums))

def solve_problem_1920(input_data):
    """수 찾기 - 이진 탐색"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    a_set = set(map(int, lines[1].split()))
    m = int(lines[2])
    queries = list(map(int, lines[3].split()))
    results = []
    for q in queries:
        results.append("1" if q in a_set else "0")
    return '\n'.join(results)

def solve_problem_10815(input_data):
    """숫자 카드"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    cards = set(map(int, lines[1].split()))
    m = int(lines[2])
    queries = list(map(int, lines[3].split()))
    results = []
    for q in queries:
        results.append("1" if q in cards else "0")
    return '\n'.join(results)

def solve_problem_11399(input_data):
    """ATM - 그리디"""
    lines = input_data.strip().split('\n')
    n = int(lines[0])
    times = list(map(int, lines[1].split()))
    times.sort()
    total = 0
    cumsum = 0
    for t in times:
        cumsum += t
        total += cumsum
    return str(total)

def solve_problem_11047(input_data):
    """동전 0 - 그리디"""
    lines = input_data.strip().split('\n')
    n, k = map(int, lines[0].split())
    coins = [int(lines[i]) for i in range(1, n + 1)]
    coins.reverse()  # 큰 것부터
    count = 0
    for coin in coins:
        count += k // coin
        k %= coin
    return str(count)

def solve_problem_1010(input_data):
    """다리 놓기 - 조합 nCr"""
    from math import comb
    lines = input_data.strip().split('\n')
    t = int(lines[0])
    results = []
    for i in range(1, t + 1):
        n, m = map(int, lines[i].split())
        results.append(str(comb(m, n)))
    return '\n'.join(results)

def solve_problem_9095(input_data):
    """1, 2, 3 더하기 - DP"""
    lines = input_data.strip().split('\n')
    t = int(lines[0])
    # DP 미리 계산
    dp = [0] * 12
    dp[1] = 1
    dp[2] = 2
    dp[3] = 4
    for i in range(4, 12):
        dp[i] = dp[i-1] + dp[i-2] + dp[i-3]
    results = []
    for i in range(1, t + 1):
        n = int(lines[i])
        results.append(str(dp[n]))
    return '\n'.join(results)

def solve_problem_1202(input_data):
    """보석 도둑 - 그리디 + 우선순위 큐"""
    import heapq
    lines = input_data.strip().split('\n')
    n, k = map(int, lines[0].split())

    jewels = []
    for i in range(1, n + 1):
        m, v = map(int, lines[i].split())
        jewels.append((m, v))

    bags = []
    for i in range(n + 1, n + k + 1):
        bags.append(int(lines[i]))

    jewels.sort()  # 무게 기준 정렬
    bags.sort()    # 용량 기준 정렬

    result = 0
    heap = []  # 최대 힙 (가치 음수로 저장)
    j = 0

    for bag in bags:
        # 현재 가방에 넣을 수 있는 보석들을 힙에 추가
        while j < n and jewels[j][0] <= bag:
            heapq.heappush(heap, -jewels[j][1])
            j += 1
        # 가장 비싼 보석 선택
        if heap:
            result -= heapq.heappop(heap)

    return str(result)

def solve_problem_1406(input_data):
    """에디터 - 스택 두개 사용"""
    lines = input_data.strip().split('\n')
    left = list(lines[0])  # 커서 왼쪽
    right = []  # 커서 오른쪽 (역순)
    m = int(lines[1])
    for i in range(2, 2 + m):
        cmd = lines[i]
        if cmd == 'L':
            if left:
                right.append(left.pop())
        elif cmd == 'D':
            if right:
                left.append(right.pop())
        elif cmd == 'B':
            if left:
                left.pop()
        elif cmd.startswith('P '):
            left.append(cmd[2])
    return ''.join(left) + ''.join(reversed(right))

# ========== 테스트케이스 생성기 ==========

def generate_testcases_10773(count):
    """제로 문제 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        k = random.randint(5, 20)
        nums = []
        stack_size = 0
        for _ in range(k):
            if stack_size > 0 and random.random() < 0.3:
                nums.append(0)
                stack_size -= 1
            else:
                nums.append(random.randint(1, 1000))
                stack_size += 1
        input_data = f"{k}\n" + "\n".join(map(str, nums))
        output_data = solve_problem_10773(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_9012(count):
    """괄호 문제 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        t = random.randint(3, 6)
        cases = []
        for _ in range(t):
            if random.random() < 0.5:
                # valid
                n = random.randint(1, 5)
                s = "(" * n + ")" * n
                # shuffle a bit
                s_list = list(s)
                for _ in range(random.randint(0, 2)):
                    i = random.randint(0, len(s_list) - 2)
                    if s_list[i] == '(' and s_list[i+1] == ')':
                        s_list[i], s_list[i+1] = s_list[i+1], s_list[i]
                s = ''.join(s_list)
            else:
                # possibly invalid
                n = random.randint(2, 8)
                s = ''.join(random.choice(['(', ')']) for _ in range(n))
            cases.append(s)
        input_data = f"{t}\n" + "\n".join(cases)
        output_data = solve_problem_9012(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_hashing(count):
    """Hashing 문제 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        length = random.randint(3, 15)
        s = ''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(length))
        input_data = f"{length}\n{s}"
        output_data = solve_hashing(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_if3(count):
    """if 3 문제 테스트케이스 생성"""
    testcases = []
    for i in range(count):
        length = random.randint(5, 15)
        if i < count // 2:
            # 연속 3개 같은 문자 있는 경우
            pos = random.randint(0, length - 3)
            char = random.choice('ABCDEFGHIJ')
            s = list(''.join(random.choice('ABCDEFGHIJ') for _ in range(length)))
            s[pos] = s[pos+1] = s[pos+2] = char
            s = ''.join(s)
        else:
            # 연속 3개 같은 문자 없는 경우
            s = []
            prev = ''
            prev_count = 0
            for _ in range(length):
                c = random.choice('ABCDEFGHIJ')
                if c == prev:
                    prev_count += 1
                    if prev_count >= 2:
                        while c == prev:
                            c = random.choice('ABCDEFGHIJ')
                        prev_count = 0
                else:
                    prev_count = 0
                prev = c
                s.append(c)
            s = ''.join(s)
        input_data = f"{len(s)}\n{s}"
        output_data = solve_if3(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_1927(count):
    """최소 힙 문제 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 15)
        ops = []
        heap_size = 0
        for _ in range(n):
            if heap_size > 0 and random.random() < 0.4:
                ops.append(0)
                heap_size -= 1
            else:
                ops.append(random.randint(1, 100))
                heap_size += 1
        input_data = f"{n}\n" + "\n".join(map(str, ops))
        output_data = solve_problem_1927(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_11286(count):
    """절댓값 힙 문제 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 15)
        ops = []
        heap_size = 0
        for _ in range(n):
            if heap_size > 0 and random.random() < 0.4:
                ops.append(0)
                heap_size -= 1
            else:
                ops.append(random.randint(-100, 100))
                if ops[-1] == 0:
                    ops[-1] = 1
                heap_size += 1
        input_data = f"{n}\n" + "\n".join(map(str, ops))
        output_data = solve_problem_11286(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_12605(count):
    """단어순서 뒤집기 테스트케이스 생성"""
    words_pool = ["hello", "world", "this", "is", "a", "test", "python", "java", "code", "algorithm"]
    testcases = []
    for _ in range(count):
        n = random.randint(2, 4)
        cases = []
        for _ in range(n):
            num_words = random.randint(2, 5)
            sentence = ' '.join(random.sample(words_pool, num_words))
            cases.append(sentence)
        input_data = f"{n}\n" + "\n".join(cases)
        output_data = solve_problem_12605(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_2864(count):
    """5와 6의 차이 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        a = random.randint(1, 999)
        b = random.randint(1, 999)
        # 5와 6이 포함되도록
        a = str(a).replace('1', '5').replace('2', '6')
        b = str(b).replace('1', '5').replace('2', '6')
        input_data = f"{a} {b}"
        output_data = solve_problem_2864(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_4949(count):
    """균형잡힌 세상 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        cases = []
        for _ in range(random.randint(2, 4)):
            # 랜덤 문장 생성
            if random.random() < 0.5:
                # valid
                parts = []
                for _ in range(random.randint(1, 3)):
                    bracket = random.choice(['()', '[]'])
                    word = random.choice(['hello', 'world', 'test', ''])
                    parts.append(bracket[0] + word + bracket[1])
                cases.append(' '.join(parts) + '.')
            else:
                # possibly invalid
                s = ''.join(random.choice(['(', ')', '[', ']', 'a', 'b', ' ']) for _ in range(random.randint(5, 15)))
                cases.append(s + '.')
        cases.append('.')
        input_data = '\n'.join(cases)
        output_data = solve_problem_4949(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_11279(count):
    """최대 힙 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 15)
        ops = []
        heap_size = 0
        for _ in range(n):
            if heap_size > 0 and random.random() < 0.4:
                ops.append(0)
                heap_size -= 1
            else:
                ops.append(random.randint(1, 100))
                heap_size += 1
        input_data = f"{n}\n" + "\n".join(map(str, ops))
        output_data = solve_problem_11279(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_2750(count):
    """수 정렬하기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(3, 10)
        nums = random.sample(range(-100, 100), n)
        input_data = f"{n}\n" + "\n".join(map(str, nums))
        output_data = solve_problem_2750(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_2751(count):
    """수 정렬하기 2 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 15)
        nums = random.sample(range(-1000, 1000), n)
        input_data = f"{n}\n" + "\n".join(map(str, nums))
        output_data = solve_problem_2751(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_10989(count):
    """수 정렬하기 3 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 20)
        nums = [random.randint(1, 10000) for _ in range(n)]
        input_data = f"{n}\n" + "\n".join(map(str, nums))
        output_data = solve_problem_10989(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_1920(count):
    """수 찾기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(3, 8)
        a = random.sample(range(-100, 100), n)
        m = random.randint(3, 8)
        # 일부는 a에 있는 것, 일부는 없는 것
        queries = []
        for _ in range(m):
            if random.random() < 0.5 and a:
                queries.append(random.choice(a))
            else:
                queries.append(random.randint(-100, 100))
        input_data = f"{n}\n{' '.join(map(str, a))}\n{m}\n{' '.join(map(str, queries))}"
        output_data = solve_problem_1920(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_10815(count):
    """숫자 카드 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(3, 8)
        cards = random.sample(range(-100, 100), n)
        m = random.randint(3, 8)
        queries = []
        for _ in range(m):
            if random.random() < 0.5 and cards:
                queries.append(random.choice(cards))
            else:
                queries.append(random.randint(-100, 100))
        input_data = f"{n}\n{' '.join(map(str, cards))}\n{m}\n{' '.join(map(str, queries))}"
        output_data = solve_problem_10815(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_11399(count):
    """ATM 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(3, 8)
        times = [random.randint(1, 20) for _ in range(n)]
        input_data = f"{n}\n{' '.join(map(str, times))}"
        output_data = solve_problem_11399(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_11047(count):
    """동전 0 테스트케이스 생성"""
    testcases = []
    # 동전 금액은 항상 배수 관계여야 그리디가 성립
    coin_sets = [
        [1, 5, 10, 50, 100, 500, 1000],
        [1, 10, 100, 1000],
        [1, 5, 10, 50, 100],
    ]
    for _ in range(count):
        coins = random.choice(coin_sets)
        n = len(coins)
        k = random.randint(100, 5000)
        input_data = f"{n} {k}\n" + "\n".join(map(str, coins))
        output_data = solve_problem_11047(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_1010(count):
    """다리 놓기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        t = random.randint(2, 4)
        cases = []
        for _ in range(t):
            n = random.randint(1, 10)
            m = random.randint(n, 15)
            cases.append(f"{n} {m}")
        input_data = f"{t}\n" + "\n".join(cases)
        output_data = solve_problem_1010(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_9095(count):
    """1, 2, 3 더하기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        t = random.randint(2, 5)
        cases = [str(random.randint(1, 10)) for _ in range(t)]
        input_data = f"{t}\n" + "\n".join(cases)
        output_data = solve_problem_9095(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_1406(count):
    """에디터 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        initial = ''.join(random.choice('abcdefghij') for _ in range(random.randint(3, 8)))
        m = random.randint(3, 8)
        commands = []
        for _ in range(m):
            cmd_type = random.choice(['L', 'D', 'B', 'P'])
            if cmd_type == 'P':
                commands.append(f"P {random.choice('abcdefghij')}")
            else:
                commands.append(cmd_type)
        input_data = f"{initial}\n{m}\n" + "\n".join(commands)
        output_data = solve_problem_1406(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_1202(count):
    """보석 도둑 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(2, 5)  # 보석 수
        k = random.randint(1, 3)  # 가방 수
        jewels = []
        for _ in range(n):
            m = random.randint(1, 50)  # 무게
            v = random.randint(1, 100)  # 가치
            jewels.append(f"{m} {v}")
        bags = [str(random.randint(10, 100)) for _ in range(k)]
        input_data = f"{n} {k}\n" + "\n".join(jewels) + "\n" + "\n".join(bags)
        output_data = solve_problem_1202(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_12738(count):
    """LIS 3 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 20)
        arr = [random.randint(-100, 100) for _ in range(n)]
        input_data = f"{n}\n{' '.join(map(str, arr))}"
        output_data = solve_problem_12738(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_3033(count):
    """가장 긴 문자열 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        L = random.randint(5, 30)
        # 중복되는 부분문자열이 있도록 생성
        chars = 'abcdef'
        if random.random() < 0.7:
            # 중복이 있는 경우
            base = ''.join(random.choice(chars) for _ in range(random.randint(2, 5)))
            s = base + ''.join(random.choice(chars) for _ in range(L - len(base) * 2)) + base
            s = s[:L]
        else:
            # 모든 문자가 다른 경우
            s = ''.join(random.choice(chars) for _ in range(L))
        input_data = f"{len(s)}\n{s}"
        output_data = solve_problem_3033(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_7453(count):
    """합이 0인 네 정수 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(2, 5)
        lines = [str(n)]
        for _ in range(n):
            row = [random.randint(-50, 50) for _ in range(4)]
            lines.append(' '.join(map(str, row)))
        input_data = '\n'.join(lines)
        output_data = solve_problem_7453(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_1605(count):
    """반복 부분문자열 테스트케이스 생성"""
    return generate_testcases_3033(count)

def generate_testcases_30108(count):
    """교육적인 트리 문제 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(2, 8)
        parents = []
        for i in range(2, n + 1):
            parents.append(random.randint(1, i - 1))
        # A_i <= A_{p_i} 조건 만족하도록 생성
        values = [0] * (n + 1)
        values[1] = random.randint(50, 100)
        for i in range(2, n + 1):
            values[i] = random.randint(1, values[parents[i - 2]])
        input_data = f"{n}\n{' '.join(map(str, parents))}\n{' '.join(map(str, values[1:]))}"
        output_data = solve_problem_30108(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_2178(count):
    """미로 탐색 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(3, 8)
        m = random.randint(3, 8)
        maze = [['1'] * m for _ in range(n)]
        # 랜덤하게 일부 벽 추가 (시작점과 끝점은 항상 1)
        for i in range(n):
            for j in range(m):
                if (i, j) != (0, 0) and (i, j) != (n-1, m-1) and random.random() < 0.2:
                    maze[i][j] = '0'
        input_data = f"{n} {m}\n" + "\n".join(''.join(row) for row in maze)
        output_data = solve_problem_2178(input_data)
        if output_data != '-1':
            testcases.append((input_data, output_data))
    while len(testcases) < count:
        n, m = 4, 4
        maze = [['1'] * m for _ in range(n)]
        input_data = f"{n} {m}\n" + "\n".join(''.join(row) for row in maze)
        output_data = solve_problem_2178(input_data)
        testcases.append((input_data, output_data))
    return testcases[:count]

def generate_testcases_1697(count):
    """숨바꼭질 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(0, 1000)
        k = random.randint(0, 1000)
        input_data = f"{n} {k}"
        output_data = solve_problem_1697(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_11403(count):
    """경로 찾기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(2, 5)
        adj = [[0] * n for _ in range(n)]
        for i in range(n):
            for j in range(n):
                if i != j and random.random() < 0.4:
                    adj[i][j] = 1
        input_data = f"{n}\n" + "\n".join(' '.join(map(str, row)) for row in adj)
        output_data = solve_problem_11403(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_11724(count):
    """연결 요소의 개수 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(3, 8)
        m = random.randint(1, min(n * (n-1) // 2, 10))
        edges = set()
        while len(edges) < m:
            u = random.randint(1, n)
            v = random.randint(1, n)
            if u != v:
                edges.add((min(u, v), max(u, v)))
        input_data = f"{n} {m}\n" + "\n".join(f"{u} {v}" for u, v in edges)
        output_data = solve_problem_11724(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_24444(count):
    """BFS 1 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 10)
        m = random.randint(3, min(n * (n-1) // 2, 15))
        r = random.randint(1, n)
        edges = set()
        while len(edges) < m:
            u = random.randint(1, n)
            v = random.randint(1, n)
            if u != v:
                edges.add((min(u, v), max(u, v)))
        input_data = f"{n} {m} {r}\n" + "\n".join(f"{u} {v}" for u, v in edges)
        output_data = solve_problem_24444(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_24445(count):
    """BFS 2 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 10)
        m = random.randint(3, min(n * (n-1) // 2, 15))
        r = random.randint(1, n)
        edges = set()
        while len(edges) < m:
            u = random.randint(1, n)
            v = random.randint(1, n)
            if u != v:
                edges.add((min(u, v), max(u, v)))
        input_data = f"{n} {m} {r}\n" + "\n".join(f"{u} {v}" for u, v in edges)
        output_data = solve_problem_24445(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_24479(count):
    """DFS 1 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 10)
        m = random.randint(3, min(n * (n-1) // 2, 15))
        r = random.randint(1, n)
        edges = set()
        while len(edges) < m:
            u = random.randint(1, n)
            v = random.randint(1, n)
            if u != v:
                edges.add((min(u, v), max(u, v)))
        input_data = f"{n} {m} {r}\n" + "\n".join(f"{u} {v}" for u, v in edges)
        output_data = solve_problem_24479(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_24480(count):
    """DFS 2 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(5, 10)
        m = random.randint(3, min(n * (n-1) // 2, 15))
        r = random.randint(1, n)
        edges = set()
        while len(edges) < m:
            u = random.randint(1, n)
            v = random.randint(1, n)
            if u != v:
                edges.add((min(u, v), max(u, v)))
        input_data = f"{n} {m} {r}\n" + "\n".join(f"{u} {v}" for u, v in edges)
        output_data = solve_problem_24480(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_2220(count):
    """힙 정렬 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        n = random.randint(2, 50)
        input_data = str(n)
        output_data = solve_problem_2220(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_3025(count):
    """돌 던지기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        r = random.randint(3, 8)
        c = random.randint(3, 6)
        board = [['.' for _ in range(c)] for _ in range(r)]
        # 랜덤하게 벽 추가
        for i in range(r):
            for j in range(c):
                if random.random() < 0.15:
                    board[i][j] = 'X'
        n = random.randint(1, 5)
        throws = [random.randint(1, c) for _ in range(n)]
        input_data = f"{r} {c}\n" + "\n".join(''.join(row) for row in board) + f"\n{n}\n" + "\n".join(map(str, throws))
        output_data = solve_problem_3025(input_data)
        testcases.append((input_data, output_data))
    return testcases

def generate_testcases_7889(count):
    """힙 세기 테스트케이스 생성"""
    testcases = []
    for _ in range(count):
        t = random.randint(1, 2)
        cases = []
        for _ in range(t):
            n = random.randint(2, 8)
            m = random.randint(100, 1000000)
            parents = []
            for i in range(2, n + 1):
                parents.append(str(random.randint(1, i - 1)))
            cases.append(f"{n} {m}\n" + "\n".join(parents))
        input_data = f"{t}\n" + "\n".join(cases)
        output_data = solve_problem_7889(input_data)
        testcases.append((input_data, output_data))
    return testcases

# ========== 메인 로직 ==========

PROBLEM_GENERATORS = {
    'problem-10773': generate_testcases_10773,
    'problem-9012': generate_testcases_9012,
    'hashing': generate_testcases_hashing,
    'problem-15829': generate_testcases_hashing,
    'if-3': generate_testcases_if3,
    'problem-15551': generate_testcases_if3,
    'problem-1927': generate_testcases_1927,
    'problem-11286': generate_testcases_11286,
    'problem-12605': generate_testcases_12605,
    'problem-2864': generate_testcases_2864,
    'problem-4949': generate_testcases_4949,
    # 추가된 generator들
    'problem-11279': generate_testcases_11279,
    'problem-2750': generate_testcases_2750,
    'problem-2751': generate_testcases_2751,
    'problem-10989': generate_testcases_10989,
    'problem-1920': generate_testcases_1920,
    'problem-10815': generate_testcases_10815,
    'problem-11399': generate_testcases_11399,
    'problem-11047': generate_testcases_11047,
    'problem-1010': generate_testcases_1010,
    'problem-9095': generate_testcases_9095,
    'problem-1406': generate_testcases_1406,
    # 새로 추가된 generator들
    'problem-1202': generate_testcases_1202,
    # 그래프/BFS/DFS 문제들
    'problem-2178': generate_testcases_2178,
    'problem-1697': generate_testcases_1697,
    'problem-11403': generate_testcases_11403,
    'problem-11724': generate_testcases_11724,
    'problem-24444': generate_testcases_24444,
    'problem-24445': generate_testcases_24445,
    'problem-24479': generate_testcases_24479,
    'problem-24480': generate_testcases_24480,
    # 추가 문제들
    'problem-12738': generate_testcases_12738,
    'problem-3033': generate_testcases_3033,
    'problem-7453': generate_testcases_7453,
    'problem-1605': generate_testcases_1605,
    'problem-30108': generate_testcases_30108,
    # 새로 추가된 문제
    'problem-2220': generate_testcases_2220,
    'problem-3025': generate_testcases_3025,
    'problem-7889': generate_testcases_7889,
}

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    conn = psycopg2.connect(SUPABASE_URL)
    cursor = conn.cursor()

    # 5개 미만 테스트케이스 문제 조회
    cursor.execute("""
        SELECT p.id, p.slug, COUNT(pt.id) as test_count
        FROM problems p
        LEFT JOIN problem_tests pt ON p.id = pt.problem_id
        GROUP BY p.id, p.slug
        HAVING COUNT(pt.id) < 5
        ORDER BY p.slug
    """)

    problems = cursor.fetchall()
    updated = 0

    for problem_id, slug, current_count in problems:
        if slug not in PROBLEM_GENERATORS:
            print(f"[SKIP] {slug}: no generator")
            continue

        needed = 5 - current_count
        if needed <= 0:
            continue

        print(f"[{slug}] Generating {needed} test cases...")

        generator = PROBLEM_GENERATORS[slug]
        testcases = generator(needed)

        for i, (input_data, output_data) in enumerate(testcases):
            case_no = current_count + i + 1

            # 파일 저장
            tests_dir = os.path.join(STORAGE_DIR, slug, 'tests')
            in_path = os.path.join(tests_dir, f'{case_no}.in')
            out_path = os.path.join(tests_dir, f'{case_no}.out')

            write_file(in_path, input_data)
            write_file(out_path, output_data)

            # DB 저장
            rel_in_path = f"problems/{slug}/tests/{case_no}.in"
            rel_out_path = f"problems/{slug}/tests/{case_no}.out"

            cursor.execute("""
                INSERT INTO problem_tests (problem_id, case_no, in_path, out_path, is_hidden)
                VALUES (%s, %s, %s, %s, %s)
            """, (problem_id, case_no, rel_in_path, rel_out_path, False))

        print(f"  -> Added {needed} test cases (now: 5 total)")
        updated += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"\n=== Summary ===")
    print(f"Problems updated: {updated}")

if __name__ == "__main__":
    random.seed(42)  # 재현 가능성을 위해
    main()
