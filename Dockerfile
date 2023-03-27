FROM node:19-alpine

RUN apk add nmap

COPY yarn.lock /app/

RUN yarn install

COPY . /app

WORKDIR /app

CMD [ "node", "index.js" ]
