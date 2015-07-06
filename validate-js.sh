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
java -jar test/compiler.jar --js app.js --externs test/openmix-externs.js --compilation_level ADVANCED --js_output_file /dev/null --warning_level VERBOSE --language_in ECMASCRIPT5
echo -e "${no_color}"

echo -e "${cyan}Validating with JSHint${red}"
echo
node_modules/jshint/bin/jshint --config jshintConfig.json app.js
node_modules/jshint/bin/jshint --config test/jshintConfigTests.json test/tests.js
echo -e "${no_color}"
