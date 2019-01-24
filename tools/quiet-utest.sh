#!/usr/bin/env bash

TEST_NAME="unit"
TEST_OUT=utest-out.txt

TOOLS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TMP_DIR=$TOOLS_DIR/../tmp
NMB_DIR=$TOOLS_DIR/../node_modules/.bin

mkdir -p $TMP_DIR

echo "running $TEST_NAME tests"
FORCE_COLOR=1 npm -s run utest > $TMP_DIR/$TEST_OUT 2>&1
TEST_RC=$?

egrep '^\s*\d+.\s*passing' $TMP_DIR/$TEST_OUT

if [ $TEST_RC -eq 0 ]
then
  echo "$TEST_NAME tests ran successfully!!"
  exit 0
else
  cat $TMP_DIR/$TEST_OUT
  echo ""
  echo "$TEST_NAME tests failed!!"
  exit 1
fi
