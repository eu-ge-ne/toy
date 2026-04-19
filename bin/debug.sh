#!/bin/bash

deno -A --deny-write --inspect src/main.ts "$1"
