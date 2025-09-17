FROM node:21.2.0

RUN mkdir /app

WORKDIR /app
COPY . /app

RUN yarn install
RUN yarn run build

CMD yarn start