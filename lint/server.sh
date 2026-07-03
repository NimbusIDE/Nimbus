#!/bin/bash
set -e

cd "$(dirname "$0")/../nimbus/server"

npm run lint
