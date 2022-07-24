FROM node:16-alpine as deps
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=web --docker

RUN cp out/yarn.lock out/json -r .

# COPY package.json yarn.lock .yarnrc.yml ./
# COPY .yarn .yarn
# # RUN yarn plugin import workspace-tools
# COPY apps apps
# COPY packages packages
# RUN find apps \! -name "package.json" -mindepth 2 -maxdepth 2 -print | xargs rm -rf



# FROM node:16-alpine as app
# ENV NODE_ENV development
# ENV SHELL /bin/ash
# WORKDIR /app
# COPY --from=deps /app .
# RUN yarn --immutable
# COPY . .
# WORKDIR /app/apps/web
# RUN yarn generate
# EXPOSE 3000
# CMD [ "yarn", "watch" ]

ENTRYPOINT ["tail", "-f", "/dev/null"]
