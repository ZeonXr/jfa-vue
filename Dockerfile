FROM node:20.16.0-alpine

WORKDIR /jfa-vue

COPY . .

RUN npm install pnpm nrm -g

RUN nrm use tencent

RUN pnpm install

CMD [ "pnpm", "run" , "server"]

EXPOSE ${SERVER_PORT:-8080}