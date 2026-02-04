#!/bin/bash

deno check --all --frozen --reload
deno test --doc --coverage=tmp/cov/ --coverage-raw-data-only --junit-path=tmp/junit.xml
deno coverage --lcov tmp/cov/ > tmp/lcov.info
