#!/usr/bin/env bash

if [[ -n "${1}" ]]; then
  cat "${1}" | docker exec -i postgres_millenium psql -U funny_user -d millenium
else
  docker exec -it postgres_millenium psql -U funny_user -d millenium
fi

