#!/bin/bash

APP_V=$(deno ./etc/version.ts)
DENO_V=$(deno -v)
EXPECTED="toy $APP_V ($DENO_V)"

deno compile --quiet --frozen --reload --output tmp/toy -ERW main.ts

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
