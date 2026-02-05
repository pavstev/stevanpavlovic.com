#!/bin/bash

# rs (Run Script) - Enhanced dispatcher for project scripts
# Usage: ./rs <command> [args...]

COMMAND=$1
shift

GOCLI_PATH="tools/golib/dist/gocli"

if [ -z "$COMMAND" ]; then
  echo "Usage: $0 <command> [args...]"
  echo ""

  # List Python commands
  if [ -d "tools/pylib/cmd" ]; then
    echo "Python Commands:"
    ls -1 tools/pylib/cmd/*.py 2> /dev/null | xargs -n 1 basename | sed 's/\.py//' | grep -v '__init__'
    echo ""
  fi

  echo "Go Commands:"
  if [ ! -f "$GOCLI_PATH" ]; then
    echo "Building gocli..."
    pnpm go-build
  fi
  $GOCLI_PATH --help

  exit 1
fi

# Check for Python command
PY_SCRIPT_PATH="tools/pylib/cmd/${COMMAND}.py"
if [ -f "$PY_SCRIPT_PATH" ]; then
  uv run python -m tools.pylib.main $COMMAND "$@"
  exit $?
fi

# Assume it is a Go command
if [ ! -f "$GOCLI_PATH" ]; then
  echo "Building gocli..."
  pnpm go-build
fi

$GOCLI_PATH $COMMAND "$@"
exit $?
