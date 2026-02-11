#!/bin/bash

dir=$(dirname "$0")

rm -rf "$dir/../tmp/test"
deno check --all --frozen --reload
deno test \
    --doc \
    --coverage="$dir/../tmp/test/cov" \
    --coverage-raw-data-only \
    --junit-path="$dir/../tmp/test/junit.xml"
deno coverage --lcov "$dir/../tmp/test/cov" > "$dir/../tmp/test/lcov"
