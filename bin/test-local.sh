#!/bin/bash

dir=$(dirname "$0")

"$dir/test.sh"
genhtml -o "$dir/../tmp/test/html" "$dir/../tmp/test/lcov"
open "$dir/../tmp/test/html/index.html"
