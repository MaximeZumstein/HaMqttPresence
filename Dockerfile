FROM node:19-alpine

RUN apk add nmap

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

USER node

CMD [ "node", "index.js" ]
