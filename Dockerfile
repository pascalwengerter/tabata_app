# Frontend Stage
FROM node:20-slim AS frontend
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml /app
RUN pnpm install --frozen-lockfile
COPY src/ /app/src/
COPY vite.config.js /app
RUN pnpm run build

# Backend Stage
FROM ruby:2.7.6 AS backend

ENV APP_HOME /app
RUN mkdir $APP_HOME
WORKDIR $APP_HOME


COPY Gemfile Gemfile.lock $APP_HOME/
RUN bundle install

ADD . $APP_HOME

COPY --from=frontend /app/public /app/public

EXPOSE 4567

CMD ["bundle", "exec", "rackup", "--host", "0.0.0.0", "-p", "4567"]
