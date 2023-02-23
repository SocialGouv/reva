#!/bin/bash
# Debug, echo every command
if [[ -n "$BUILDPACK_DEBUG" ]]; then
  set -x
fi
set -euo pipefail

basedir="$( cd -P "$(dirname $(dirname "$0" ))" && pwd )"

# Listen on PORT
export TRAEFIK_ENTRYPOINTS_web_ADDRESS=":${PORT}"

# use TRAEFIK_PROVIDERS_FILE_FILENAME provider file if defined
if [[ -n "${TRAEFIK_PROVIDERS_FILE_FILENAME-}" ]] ;then
    if [[ -f "$TRAEFIK_PROVIDERS_FILE_FILENAME" ]] ; then
       echo "## Use ENV TRAEFIK_PROVIDERS_FILE_FILENAME=$TRAEFIK_PROVIDERS_FILE_FILENAME"
    else
       echo "## Not found TRAEFIK_PROVIDERS_FILE_FILENAME=${TRAEFIK_PROVIDERS_FILE_FILENAME-}"
    fi
else
    # use dynamic provider file if defined
    traefik_dynamic_config="$basedir/config/dynamic.yml"
    if [ -f "$traefik_dynamic_config" ] ; then
        export TRAEFIK_PROVIDERS_FILE_FILENAME="$traefik_dynamic_config"
        export TRAEFIK_PROVIDERS_FILE_WATCH="true"
        echo "## Use default TRAEFIK_PROVIDERS_FILE_FILENAME=$TRAEFIK_PROVIDERS_FILE_FILENAME"
    fi
fi
echo "# start traefik"
#
# mutual exclusive configuration (configFile, cli or environnement)
#   this script use only environment TRAEFIK_ var
#

bin/traefik

echo "# end traefik"
