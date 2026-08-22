#!/bin/bash

deno --allow-env \
    --allow-read \
    --allow-write \
    --cpu-prof --cpu-prof-md --cpu-prof-flamegraph \
    src/main.ts "$1"
