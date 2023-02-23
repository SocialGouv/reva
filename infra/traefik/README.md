# Scalingo Traefik Buildpack

This buildpack aims at deploying a traefik instance on the Scalingo PaaS platform.

# Traefik

![traefik](https://doc.traefik.io/traefik/assets/img/traefik-architecture.png)

[Traefik](https://github.com/traefik/traefik) is modern HTTP reverse proxy and load balancer that makes deploying microservices easy.

# Buildpack

This buildpack is inspired from [heroku-buildpack-traefik](https://github.com/banzera/heroku-buildpack-traefik.git)

This buildpack does the following (see `bin/compile` for details):
- install traefik (select `TRAEFIK_VERSION`,  default is `2.5.6`)
- start `run.sh` script at boot time

# Usage

To deploy a *traefik* instance app on scalingo:
- define `BUILDPACK_URL=url_to_this_buildpack` or in .buildpacks file
- define `TRAEFIK_var` according to [traefik documentation][0]
``` bash
# sample
TRAEFIK_LOG=true
TRAEFIK_LOG_LEVEL=INFO # DEBUG
TRAEFIK_ACCESSLOG=true
TRAEFIK_ENTRYPOINTS_web_FORWARDEDHEADERS_TRUSTEDIPS=10.0.0.0/8 # to trust scalingo LB and Forward X-Forwarded- to backend
# To enable traefik dashboard / api (warning: please use auth middleware to protect the path)
TRAEFIK_API=true
TRAEFIK_API_DASHBOARD=true
TRAEFIK_API_DEBUG=false
TRAEFIK_API_INSECURE=true
```

- Then, define a `provider` for dynamic configuration discovery (route, middleware,backend services), and traefik do the rest . 
  - Option 1 (default): define a static file or dynamic provider file[file provider documentation][1]: default is `config/dynamic.yml`, in your custom app repository
     - The file can be a static file or dynamic file with (go templating variable), see example in `config/dynamic.yml.sample`
     - You can define another location with `TRAEFIK_PROVIDERS_FILE_FILENAME=/app/config/mycustom.yml`

  - Option 2: Or define Redis provider [redis provider documentation][2]: add a `redis addons`, and configure `TRAEFIK_PROVIDERS_REDIS_` variables, and store as KV your config in redis.
  - Option 3: Or define HTTP provider [HTTP provider documentation][3]: configure `TRAEFIK_PROVIDERS_HTTP_` variables, and provide your dynamic configuration via an HTTP endpoint.
    - `TRAEFIK_PROVIDERS_HTTP_ENDPOINT=https://api.my-conf.domain/config/simple-conf.json`


[0]: https://doc.traefik.io/traefik/reference/static-configuration/env/
[1]: https://doc.traefik.io/traefik/providers/file/
[2]: https://doc.traefik.io/traefik/providers/redis/
[3]: https://doc.traefik.io/traefik/providers/http/
