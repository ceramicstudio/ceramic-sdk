# Ceramic-one integration tests

## Setup

A Ceramic One node needs to be running, for example using Docker:

```sh
docker run --platform=linux/x86_64 -p 5001:5001 -e CERAMIC_ONE_STORE_DIR=/ -e CERAMIC_ONE_NETWORK=in-memory -e CERAMIC_ONE_BIND_ADDRESS=0.0.0.0:5001 public.ecr.aws/r5b3e0r5/3box/ceramic-one:latest
```

## Running tests

```sh
pnpm test
```