FROM node:latest

WORKDIR /usr/app/server

COPY package.json .

RUN npm install

