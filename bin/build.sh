#!/bin/bash

dir=$(dirname "$0")

APP_V=$(echo "import x from '$dir/../deno.json' with { type: 'json' }; Deno.stdout.write(new TextEncoder().encode(x.version));" | deno run -)

echo "Building $APP_V"

DIST="./dist"
rm -rf $DIST
mkdir -p $DIST

deno compile -q --frozen --output "$DIST/toy" -ERW src/main.ts
ACTUAL="$(./dist/toy --version)"
rm -rf "$DIST/toy"
EXPECTED="toy $APP_V (deno 2."
if [[ $ACTUAL == "$EXPECTED"* ]]; then
    echo Test build - ok
else
    echo Test build - fail
    echo "    Expected: $EXPECTED"
    echo "    Actual  : $ACTUAL"
    exit 1
fi

MACOS="$DIST/toy-aarch64-apple-darwin-$APP_V"
LINUX="$DIST/toy-x86_64-unknown-linux-gnu-$APP_V"
WINDOWS="$DIST/toy-x86_64-pc-windows-msvc-$APP_V"

deno compile -q --target aarch64-apple-darwin --frozen --output "$MACOS" -ERW src/main.ts
deno compile -q --target x86_64-unknown-linux-gnu --frozen --output "$LINUX" -ERW src/main.ts
deno compile -q --target x86_64-pc-windows-msvc --frozen --output "$WINDOWS.exe" -ERW src/main.ts
