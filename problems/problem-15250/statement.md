# Palindromic Partitions

## 문제 설명

A partition of a string s is a set of one or more non-overlapping non-empty substrings of s (call them a1, a2, a3, . . . , ad), such that s is their concatenation: s = a1+a2+a3+. . .+ad. We call these substrings "chunks" and define the length of such a partition to be the number of chunks, d.We can represent the partition of a string by writing each chunk in parentheses. For example, the string "decode" can be partitioned as(d)(ec)(ode)or(d)(e)(c)(od)(e)or(decod)(e)or(decode)or(de)(code)or a number of other ways.A partition is palindromic if its chunks form a palindrome when we consider each chunk as an atomic unit. For example, the only palindromic partitions of "decode" are(de)(co)(de)and(decode). This also illustrates that every word has a trivial palindromic partition of length one.Your task is to compute the maximal possible number of chunks in palindromic partition.

## 입력

The input starts with the number of test cases t in the first line. The following t lines describe individual test cases consisting of a single word s, containing only lowercase letters of the English alphabet. There are no spaces in the input.

## 출력

For every testcase output a single number: the length of the longest palindromic partition of the input word s.

## 제한 사항

- **시간 제한**: 10 초
- **메모리 제한**: 128 MB

## 예제

### 예제 1

**입력**
```
4
bonobo
deleted
racecar
racecars
```

**출력**
```
3
5
7
1
```

---

**출처**: [https://www.acmicpc.net/problem/15250](https://www.acmicpc.net/problem/15250)
