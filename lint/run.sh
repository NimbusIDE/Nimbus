#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Linting frontend..."
bash lint/frontend.sh

echo "Linting server..."
bash lint/server.sh

echo "All lint checks passed."
