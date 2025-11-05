#!/bin/bash

echo "=== Judge0 Direct Test ==="
echo ""

echo "Test 1: Minimal submission (only required fields)"
curl -X POST "http://3.27.95.194:2358/submissions/batch?base64_encoded=false" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json" \
  -d '{
  "submissions": [
    {
      "language_id": 71,
      "source_code": "print(\"hello\")"
    }
  ]
}'
echo ""
echo ""

echo "Test 2: With empty string stdin and expected_output"
curl -X POST "http://3.27.95.194:2358/submissions/batch?base64_encoded=false" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json" \
  -d '{
  "submissions": [
    {
      "language_id": 71,
      "source_code": "print(\"hello\")",
      "stdin": "",
      "expected_output": "hello"
    }
  ]
}'
echo ""
echo ""

echo "Test 3: Full submission (like our Java code)"
curl -X POST "http://3.27.95.194:2358/submissions/batch?base64_encoded=false" \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json" \
  -d '{
  "submissions": [
    {
      "source_code": "print(\"hello\")",
      "language_id": 71,
      "stdin": "",
      "expected_output": "hello\n",
      "cpu_time_limit": 2.0,
      "memory_limit": 128000
    }
  ]
}'
echo ""
