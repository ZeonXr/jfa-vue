FROM node:20.16.0-alpine

WORKDIR /jfa-vue

COPY . .

RUN npm install pnpm nrm -g

RUN nrm use tencent

RUN pnpm install

RUN pnpm build

WORKDIR /jfa-vue/express

RUN pnpm install

CMD [ "pnpm", "start" ]

EXPOSE 8080