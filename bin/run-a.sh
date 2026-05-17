#!/bin/bash

deno --allow-env \
    --allow-read=./ \
    --allow-write \
    src/main.ts "$1"
