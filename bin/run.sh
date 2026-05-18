#!/bin/bash

deno --allow-env \
    --allow-read \
    --deny-write \
    src/main.ts "$1"
