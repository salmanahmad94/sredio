# sredio

A small Zapier-style automation app. Sign in with GitHub, build a Zap ("when a pull request is opened, comment on it"), turn it on, and sredio comments on every new pull request in that repository. A Copilot can draft a Zap from a sentence.

TypeScript throughout: Angular (web), Express + MongoDB (API), and a shared package for the app catalog and types.

## What needs to be running

| Service                       | Why                                                    | Needed for      |
| ----------------------------- | ------------------------------------------------------ | --------------- |
| **MongoDB**                   | Users, Zaps, runs and the job queue                    | Everything      |
| **API** (port 3000)           | REST API, GitHub sign-in, webhooks, background jobs    | Everything      |
| **Web** (port 4200, dev only) | The Angular app; proxies `/api` and `/auth` to the API | `npm run dev`   |
| **ngrok**                     | Gives GitHub a public URL to send webhooks to          | Turning Zaps on |

`npm run dev` starts the API and the web app together. MongoDB and ngrok run separately.

## Setup

Requires Node 22.22+ and MongoDB.

1. **Install:** `npm install`
2. **Create a GitHub OAuth App** at https://github.com/settings/developers → New OAuth App:
    - Homepage URL: `http://localhost:4200`
    - Authorization callback URL: `http://localhost:4200/auth/github/callback`
3. **Copy the env file:** `cp .env.example .env`, then fill it in (see below).
4. **Start MongoDB**, e.g. `brew services start mongodb-community`, or `docker run -d -p 27017:27017 mongo`.
5. **Start a tunnel:** `ngrok http 3000`, and put its `https://…` URL in `PUBLIC_URL`.
6. **Run:** `npm run dev`, then open http://localhost:4200.

## Environment variables

Set in `.env` at the repository root. Both `npm run dev` and `npm start` read it.

| Variable                                                              | Required        | What it is                                                                                                              |
| --------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`                            | Yes             | From the GitHub OAuth App                                                                                               |
| `ENCRYPTION_KEY`                                                      | Yes             | Encrypts GitHub tokens and webhook secrets. `openssl rand -base64 32`                                                   |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`                         | Yes             | Sign the session tokens. `openssl rand -base64 48` each                                                                 |
| `APP_URL`                                                             | In dev          | Where you open the app: `http://localhost:4200` in dev. Default `http://localhost:3000`, which is right for `npm start` |
| `PUBLIC_URL`                                                          | To turn Zaps on | Public URL that reaches the API, e.g. the ngrok URL. Without it, Zaps save but can't be turned on                       |
| `OPENAI_API_KEY`                                                      | For the Copilot | Without it the Copilot says it isn't configured; everything else works                                                  |
| `COPILOT_MODEL`                                                       | No              | OpenAI model for the Copilot. Default `gpt-6.2-sol`                                                                     |
| `MONGODB_URI`                                                         | No              | Default `mongodb://127.0.0.1:27017/sredio`                                                                              |
| `PORT`                                                                | No              | API port. Default `3000`                                                                                                |
| `COOKIE_SECURE`                                                       | No              | `true` when served over HTTPS. Default `false`                                                                          |
| `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_SECONDS`               | No              | Default 15 minutes and 7 days                                                                                           |
| `AGENDA_COLLECTION`, `AGENDA_PROCESS_EVERY`, `AGENDA_MAX_CONCURRENCY` | No              | Job queue settings. Defaults `agendaJobs`, `10 seconds`, `20`                                                           |
| `LOG_DIRECTORY`                                                       | No              | Where log files go, relative to `apps/api`. Default `logs`                                                              |

The API checks these at startup and stops with a clear message if one is missing or malformed.

## Turning a Zap on

1. Sign in with GitHub. sredio asks for `repo` (to comment) and `admin:repo_hook` (to add the webhook).
2. Click **New Zap**, or describe one to the Copilot.
3. Pick a repository you're an admin of; the field suggests them.
4. Write the comment. **Insert field…** adds values from the pull request, like `{{pull_request.user.login}}`, and the preview shows the result.
5. Switch it **On** and save. sredio adds a webhook to the repository.
6. Open a pull request on that repository. The comment appears within a few seconds, and the run shows under **Recent runs**.

Turning the Zap off, changing its repository or deleting it removes the webhook.

If ngrok restarts with a new URL, update `PUBLIC_URL`, restart the API, then turn each Zap off and on again so its webhook points at the new URL.

## Production

```sh
npm run build   # Angular app + API bundle
npm start       # API on PORT, serving the Angular app too
```

In production the API serves the web app from the same address, so open `http://localhost:3000` and set `APP_URL` and the OAuth App's callback URL to match. MongoDB still needs to be running, and `PUBLIC_URL` still needs to reach the API for webhooks.

## Other commands

| Command             | Does                                            |
| ------------------- | ----------------------------------------------- |
| `npm test`          | API tests (Vitest)                              |
| `npm run typecheck` | Type-checks the shared package, API and web app |
| `npm run format`    | Formats with Prettier                           |
