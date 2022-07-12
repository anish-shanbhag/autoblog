FROM node:16-alpine
ENV NODE_ENV development
WORKDIR /app
COPY . .
RUN yarn --immutable
WORKDIR /app/apps/web
RUN yarn generate
WORKDIR /app
EXPOSE 3000
CMD [ "yarn", "web" ]
