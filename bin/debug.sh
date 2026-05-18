#!/bin/bash

deno --allow-env \
    --allow-read \
    --deny-write \
    --inspect-brk \
    src/main.ts "$1"
