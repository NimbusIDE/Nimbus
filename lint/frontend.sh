#!/bin/bash
set -e

cd "$(dirname "$0")/../nimbus"

npm run lint
