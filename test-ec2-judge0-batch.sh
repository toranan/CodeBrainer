#!/bin/bash

echo "=== Testing EC2 Judge0 Batch Token Fetch ==="
echo ""

# Step 1: Submit
echo "Step 1: Submitting code..."
RESPONSE=$(curl -s -X POST "http://3.27.95.194:2358/submissions/batch?base64_encoded=false" \
  -H "Content-Type: application/json" \
  -d '{"submissions": [{"language_id": 71, "source_code": "print(\"hello\")"}]}')

echo "Submit response: $RESPONSE"
TOKEN=$(echo $RESPONSE | jq -r '.[0].token')
echo "Token: $TOKEN"
echo ""

# Step 2: Fetch with batch endpoint
echo "Step 2: Fetching with batch endpoint..."
echo "URL: http://3.27.95.194:2358/submissions/batch?tokens=$TOKEN&base64_encoded=false&fields=*"
curl -s "http://3.27.95.194:2358/submissions/batch?tokens=$TOKEN&base64_encoded=false&fields=*" | jq '.'
echo ""
