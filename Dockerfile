FROM mhart/alpine-node:14
WORKDIR /usr/src/app

COPY ./src/ ./src/
RUN cd src && npm ci

EXPOSE 3000
CMD node src/index.js