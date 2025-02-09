#!/bin/sh

AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNDYwODY2ZS1kMjE4LTQ5NjEtYTc2ZC1mZTFiOWVjZGZjYmEiLCJpYXQiOjE3MzY4MjU2NjcsImV4cCI6MTczNjgyNjU2N30.AbbEjs-cxIM2QzfY25k1pLBLNjglr_2r_V1a7DfOKps"
BODY='{"paidAt": "2024/10/02","amount": 100000,"note": "test","monthlyConfigId": 1}'
USER_ID="51b1a3db-1bf7-4a61-86e3-29bb861c067d"
seq 1 10 | xargs -n1 -P4 curl -X POST -H "Content-Type: application/json" \
-H "Authorization: Bearer $AUTH_TOKEN" \
-d "$BODY" \
"http://localhost/users/$USER_ID/payments"
