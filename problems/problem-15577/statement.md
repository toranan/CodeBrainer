# Prosjek

## 문제 설명

Little Ivica received N math grades and wants to calculate their average. He knows that the average of two numbers a and b is calculated as (a + b) / 2, but he still doesn’t know how to do it for multiple numbers. He calculates the average by writing down N grades and repeating the following operations N - 1 times:He chooses two numbers and erases them.He writes down the average of the two chosen numbers.After precisely N - 1 steps, the only number written down will be the one representing the average grade to Ivica. It is your task to determine the largest average that can be obtained this way.

## 입력

The first line of input contains the integer N (1 ≤ N ≤ 20), the number from the task.The ithof the following N lines contains the integer Xi(1 ≤ Xi≤ 5), the ithgrade.

## 출력

Output the largest possible average from the task. Your solution is allowed to deviate from the official one for 0.000001.

## 제한 사항

- **시간 제한**: 1 초
- **메모리 제한**: 64 MB

## 예제

### 예제 1

**입력**
```
4
2
4
5
2
```

**출력**
```
4.000000
```

### 예제 2

**입력**
```
3
5
5
4
```

**출력**
```
4.750000
```

### 예제 3

**입력**
```
3
1
3
5
```

**출력**
```
3.500000
```

---

**출처**: [https://www.acmicpc.net/problem/15577](https://www.acmicpc.net/problem/15577)
