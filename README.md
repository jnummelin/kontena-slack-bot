[![](https://badge.imagelayers.io/jnummelin/kontena-slack-bot:latest.svg)](https://imagelayers.io/?images=jnummelin/kontena-slack-bot:latest 'Get your own badge on imagelayers.io')

# kontena-slack-bot

Slack bot for Kontena docker orchestrator



## Running

The bot is provided as Docker image which you can run pretty easily:
```
docker run -d -e SLACK_TOKEN=xoxb-1243576874-XXXXXXXXXXXXXXXXXXX -e KONTENA_TOKEN=kontena-token -e KONTENA_URL=https://192.168.100.100:8443 -e KONTENA_GRID=my-grid -e SSL_IGNORE_ERRORS=true -e BOT_NAME=kontenabot -e ALLOWED_USERS=user1,user2 --name kontenabot jnummelin/kontena-slack-bot:latest
```

The env parameters are pretty self-explanatory I think. The ALLOWED_USERS is a comma separated list of Slack users that are allowed to control the bot. If you do not specify the list at all the bot thinks it's OK to allow anyone to control it.

## Running with Kontena

It's self evident that this can be run also with Kontena. :) Here's example kontena.yml that gets things going:

```
kontenabot:
  image: jnummelin/kontena-slack-bot:latest
  environment:
    - SLACK_TOKEN=xoxb-1233425436437-dsjkudisudsa
    - KONTENA_TOKEN=kontena-token
    - KONTENA_URL=https://192.168.100.100:8443
    - KONTENA_GRID=test-grid
    - SSL_IGNORE_ERRORS=true
    - BOT_NAME=kontenabot
    - ALLOWED_USERS=user1,user2

```
