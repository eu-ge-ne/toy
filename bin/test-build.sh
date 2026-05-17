#!/bin/bash

EXPECTED=$(deno bin/version.ts)

deno compile --quiet --frozen --reload --output tmp/toy -ERW src/main.ts

ACTUAL="$(./tmp/toy -v)"

if [[ $ACTUAL = "$EXPECTED" ]]; then
    echo Test build - ok
    echo "    Output: $ACTUAL"
else
    echo Test build - fail
    echo "    Expected: $EXPECTED"
    echo "    Actual  : $ACTUAL"
    exit 1
fi
