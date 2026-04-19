#!/bin/bash

deno -A --deny-write src/main.ts "$1"
