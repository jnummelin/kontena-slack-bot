FROM kontena/cli:1.4.2
MAINTAINER jussi.nummelin@gmail.com

RUN apk update && apk --update add nodejs

WORKDIR /app

ADD package.json /app/

RUN apk --update add --virtual build-dependencies make gcc g++ python && \
    npm install && \
    apk del build-dependencies

ADD . /app


ENTRYPOINT npm start
