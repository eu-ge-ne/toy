#!/bin/bash

deno --allow-env \
    --allow-read=./ \
    --deny-write \
    --allow-write=./tmp/toy.log \
    src/main.ts "$1"
