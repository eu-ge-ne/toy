#!/bin/bash

deno --allow-env \
    --allow-read \
    --deny-write \
    --inspect \
    src/main.ts "$1"
