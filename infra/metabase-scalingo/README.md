![Metabase](metabase.png)

# Deploy Metabase on Scalingo

## One-click deployment

Run your own Metabase instance with one click.

[![Deploy](https://cdn.scalingo.com/deploy/button.svg)](https://my.scalingo.com/deploy?source=https://github.com/Scalingo/metabase-scalingo#master)

## Steps to deploy Metabase manually

1. Create an application on Scalingo

```
scalingo create my-metabase
```

2. Add a PostgreSQL for the internal usage of Metabase

```
scalingo -a my-metabase addons-add postgresql postgresql-starter-512
```

3. Configure multi-buildpack in the app environment

```
scalingo -a my-metabase env-set 'BUILDPACK_URL=https://github.com/Scalingo/multi-buildpack'
```

4. Clone this repository

```
git clone https://github.com/Scalingo/metabase-scalingo
```

5. Configure GIT

```
cd metabase-scalingo
scalingo -a my-metabase git-setup
```

6. Deploy the application

```
git push scalingo master
```

# Update Metabase on Scalingo

To upgrade to the latest version of Metabase, you only need to redeploy it, this will retrieve the latest version avaible on [the Metabase buildpack](https://github.com/metabase/metabase-buildpack).

## One-click deployment

`scalingo -a  my-metabase deploy https://github.com/Scalingo/metabase-scalingo/archive/refs/heads/master.tar.gz`

## Steps to update Metabase manually

```
cd metabase-scalingo
git pull origin master
git push scalingo master
```
