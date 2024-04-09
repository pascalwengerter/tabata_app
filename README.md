# Musclemate Tabata App

## Development

### Frontend

The frontend uses pnpm and vite. Initially, run `pnpm install`, for development run `pnpm dev` and for the final bundle `pnpm build`.

### Backend

```bash
$ docker build -t tabata-app .
$ docker run -p 5000:4567 tabata-app
```

or combined

```bash
$ docker build -t tabata-app . && docker run -p 5000:4567 tabata-app
```
and visit [localhost:5000](http://localhost:5000)
