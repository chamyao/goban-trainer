#!/bin/sh
# Bundle the web-katrain KataGo engine (worker + main-thread utils) for the app.
set -e
cd "$(dirname "$0")"
# BASE_URL "../" resolves against the worker script URL (engine/), so tfjs
# wasm paths become <site>/tfjs/ whether the app is served from the domain
# root or a subpath (e.g. GitHub Pages project sites).
DEFINES='--define:import.meta.env={"BASE_URL":"../"} --define:process.env.NODE_ENV="production"'
./node_modules/.bin/esbuild worker-entry.ts --bundle --format=iife --platform=browser \
  $DEFINES --minify --outfile=../engine/katago-worker.js
./node_modules/.bin/esbuild glue-entry.ts --bundle --format=iife --platform=browser \
  $DEFINES --minify --outfile=../engine/engine-utils.js
mkdir -p ../tfjs
cp node_modules/@tensorflow/tfjs-backend-wasm/dist/*.wasm ../tfjs/
echo "engine bundles written to ../engine, tfjs wasm to ../tfjs"
