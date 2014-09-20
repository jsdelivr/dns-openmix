#!/bin/bash

# Colors
red='\033[0;31m'
green='\033[0;32m'
yellow='\033[1;33m'
cyan='\033[0;36m'
no_color='\033[0m'

# Change to the project root directory
cd "$( dirname "${BASH_SOURCE[0]}" )"

echo
echo -e "${cyan}Validating with Google Closure Compiler${red}"
echo
java -jar tests/compiler.jar --js tests/deps.js --js app.js --compilation_level ADVANCED --js_output_file /dev/null --warning_level VERBOSE
echo -e "${no_color}"

echo -e "${cyan}Validating with JSLint${red}"
echo
java -jar tests/jslint4java-2.0.5.jar app.js tests/tests.js
echo -e "${no_color}"
