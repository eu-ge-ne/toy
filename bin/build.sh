#!/bin/bash

rm -rf ./dist
mkdir -p dist

APP_V=$(deno bin/version.ts)
DIST_MACOS="dist/toy-aarch64-apple-darwin-$APP_V"
DIST_LINUX="dist/toy-x86_64-unknown-linux-gnu-$APP_V"
DIST_WINDOWS="dist/toy-x86_64-pc-windows-msvc-$APP_V"

deno compile --target aarch64-apple-darwin --frozen --reload --output "$DIST_MACOS" -ERW main.ts
deno compile --target x86_64-unknown-linux-gnu --frozen --reload --output "$DIST_LINUX" -ERW main.ts
deno compile --target x86_64-pc-windows-msvc --frozen --reload --output "$DIST_WINDOWS.exe" -ERW main.ts
