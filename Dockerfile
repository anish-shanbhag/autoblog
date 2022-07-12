FROM node:16-alpine
ENV NODE_ENV development
ENV SHELL /bin/ash
WORKDIR /app
COPY . .
RUN yarn --immutable
WORKDIR /app/apps/web
RUN yarn generate
EXPOSE 3000
CMD [ "yarn", "watch" ]
