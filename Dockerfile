FROM node:14-alpine

WORKDIR /usr/src/app

COPY ["package.json", "yarn.lock", "./"]

RUN npm install -g yarn --force

RUN yarn install

COPY . .

COPY ormconfig.json ./build/

RUN yarn build

EXPOSE 4000

CMD ["node", "./build/index.js"]