# if 3

## 문제 설명

다음 프로그램을 실행시켰을 때, "true"를 출력하는 길이가 N인 문자열a, b를 찾는 프로그램을 작성하시오.import java.util.*;

public class Main {
    public static void main(String args[]) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next();
        String b = sc.next();
        if (!a.equals(b) && a.hashCode() == b.hashCode()) {
            System.out.println("true");
        } else {
            System.out.println("false");
        }
    }
}실행 환경은 BOJ 채점 서버의 Java 실행 환경과 같다.

## 입력

첫째 줄에 문자열의 길이 N (2 ≤ N ≤ 100)이 주어진다.

## 출력

첫째 줄에 문자열a, 둘째 줄에 문자열b를 출력한다.문자열a와b는java.util.Scanner의next메소드로 입력받을 수 있어야 한다.

## 제한 사항

- **시간 제한**: 2 초
- **메모리 제한**: 512 MB

## 예제

### 예제 1

**입력**
```
2
```

**출력**
```
AB
CD
```

### 예제 2

**입력**
```
3
```

**출력**
```
ABC
abc
```

---

**출처**: [https://www.acmicpc.net/problem/15551](https://www.acmicpc.net/problem/15551)
