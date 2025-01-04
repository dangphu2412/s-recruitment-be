#!/bin/sh

AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMWExOWY0Zi00NGUwLTRjMzgtOWQ1MC1kZTNhM2VmODJiZjciLCJpYXQiOjE3MzU5ODI3MTgsImV4cCI6MTczNTk4MzYxOH0.1NIbdaa3SS9iHa9k_FQ3fdCdr19CD7o86v3UcUdRies"
BODY='{"paidAt": "2024/10/02","amount": 100000,"note": "test","monthlyConfigId": 1}'
USER_ID="d7142b4d-ee2a-48e7-8daa-80ab204cbc00"
seq 1 10 | xargs -n1 -P4 curl -X POST -H "Content-Type: application/json" \
-H "Authorization: Bearer $AUTH_TOKEN" \
-d "$BODY" \
"http://localhost:3001/users/$USER_ID/payments"
