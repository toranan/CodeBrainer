# Hidden Anagrams

## 문제 설명

An anagram is a word or a phrase that is formed by rearranging the letters of another. For instance, by rearranging the letters of “William Shakespeare,” we can have its anagrams “I am a weakish speller,” “I’ll make a wise phrase,” and so on. Note that when A is an anagram of B, B is an anagram of A.In the above examples, differences in letter cases are ignored, and word spaces and punctuation symbols are freely inserted and/or removed. These rules are common but not applied here; only exact matching of the letters is considered.For two strings s1and s2of letters, if a substring s'1of s1is an anagram of a substring s'2of s2, we call s'1a hidden anagram of the two strings, s1and s2. Of course, s'2is also a hidden anagram of them.Your task is to write a program that, for given two strings, computes the length of the longest hidden anagrams of them.Suppose, for instance, that “anagram” and “grandmother” are given. Their substrings “nagr” and “gran” are hidden anagrams since by moving letters you can have one from the other. They are the longest since any substrings of “grandmother” of lengths five or more must contain “d” or “o” that “anagram” does not. In this case, therefore, the length of the longest hidden anagrams is four. Note that a substring must be a sequence of letters occurring consecutively in the original string and so “nagrm” and “granm” are not hidden anagrams.

## 입력

The input consists of a single test case in two lines.s1s2s1and s2are strings consisting of lowercase letters (a through z) and their lengths are between 1 and 4000, inclusive.

## 출력

Output the length of the longest hidden anagrams of s1and s2. If there are no hidden anagrams, print a zero.

## 제한 사항

- **시간 제한**: 10 초
- **메모리 제한**: 512 MB

## 예제

### 예제 1

**입력**
```
anagram
grandmother
```

**출력**
```
4
```

### 예제 2

**입력**
```
williamshakespeare
iamaweakishspeller
```

**출력**
```
18
```

### 예제 3

**입력**
```
aaaaaaaabbbbbbbb
xxxxxabababxxxxxabab
```

**출력**
```
6
```

### 예제 4

**입력**
```
abababacdcdcd
efefefghghghghgh
```

**출력**
```
0
```

---

**출처**: [https://www.acmicpc.net/problem/13402](https://www.acmicpc.net/problem/13402)
