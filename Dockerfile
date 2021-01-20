FROM mhart/alpine-node:14
WORKDIR /usr/src/app

COPY . .
RUN npm ci

EXPOSE 3000
CMD npm run start