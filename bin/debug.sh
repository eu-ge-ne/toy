#!/bin/bash

deno --allow-env \
    --allow-read=./ \
    --deny-write \
    --allow-write=./tmp/toy.log \
    --inspect-brk \
    src/main.ts "$1"
