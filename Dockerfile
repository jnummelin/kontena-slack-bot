FROM gliderlabs/alpine:3.2
MAINTAINER jussi.nummelin@gmail.com

RUN apk update && apk --update add nodejs ruby ruby-dev && gem install kontena-cli

WORKDIR app
ADD package.json /app/
RUN npm install

ADD . /app


CMD npm start
