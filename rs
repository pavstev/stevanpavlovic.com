#!/bin/bash

# rs (Run Script) - Enhanced dispatcher for project scripts
# Usage: ./rs <command> [args...]

COMMAND=$1
shift

GOCLI_PATH="tools/repokit/dist/repokit"

if [ -z "$COMMAND" ]; then
  echo "Usage: $0 <command> [args...]"
  echo ""

  echo "Go Commands:"
  if [ ! -f "$GOCLI_PATH" ]; then
    echo "Building repokit..."
    pnpm go-build
  fi
  $GOCLI_PATH --help

  exit 1
fi

# Assume it is a Go command
if [ ! -f "$GOCLI_PATH" ]; then
  echo "Building repokit..."
  pnpm go-build
fi

$GOCLI_PATH $COMMAND "$@"
exit $?
