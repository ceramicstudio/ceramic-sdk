# Ceramic Explorer app

## Prerequisites

A Ceramic One node must be running on `localhost:5101`.

## Development

- `pnpn run dev` to start the local development server
- `pnpn run build` to build the static assets for production
- `pnpm run preview` to serve the production build

## Deployment

### IPFS

Use `pnpm run deploy` to deploy the production build to IPFS (after having run `pnpn run build` to build the assets)