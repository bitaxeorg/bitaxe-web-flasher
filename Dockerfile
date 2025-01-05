FROM node:latest

WORKDIR /app

COPY . /app

RUN npm install
RUN npm run build
RUN npm install --global serve
RUN ln -s /app/out out/bitaxe-web-flasher

CMD [ "serve", "out" ]
