#!/bin/bash

# Colors
red='\033[0;31m'
green='\033[0;32m'
yellow='\033[1;33m'
nocolor='\033[0m'

run_test_suite() {
    echo
    echo -e "${yellow}Running $1 unit tests${nocolor}"
    echo
    ./node_modules/karma/bin/karma start $2
    LAST=$?
    if [ "$LAST" -ne "0" ]
    then
        echo
        echo -e "${red}$1 unit tests failed${nocolor}"
        echo
        exit 1
    fi
}

run_test_suite "Openmix application" "karma.app.conf.js"

echo
echo -e "${green}All unit tests passed${nocolor}"
echo
