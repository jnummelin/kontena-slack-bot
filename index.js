
var Slack = require('slack-client')
var exec = require('child_process').exec;

var botName = 'kontenabot' || process.env.BOT_NAME;
var botKeyword = botName + ':';

var slackToken = process.env.SLACK_TOKEN;
var autoReconnect = true;
var autoMark = true;

// Setup logging
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: botName});

// Setup crude way to allow only specified users
allowChecker = function(user) {
  return true;
}
allowedUsers = [];
if(process.env.ALLOWED_USERS) {
  allowedUsers = process.env.ALLOWED_USERS.split(',');
  allowChecker = function(user) {
    username = slack.users[user].name;
    if(allowedUsers.lastIndexOf(username) != -1) {
      return true;
    }
    return false;
  }
}

// Connect to Slack and setup message handlers
var slack = new Slack(slackToken, autoReconnect, autoMark);

slack.on('open', function () {
  log.info("Connected to " + slack.team.name + " as " + slack.self.name);
});

slack.on('message', function (message) {
  try {
    if(message.text.lastIndexOf(botKeyword, 0) === 0) {
      channel = slack.getChannelGroupOrDMByID(message.channel);
      if (allowChecker(message.user)) {
        cmd = "kontena " + message.text.substring(botKeyword.length);
        log.info({user: slack.users[message.user].name, cmd: cmd}, "Executing command");
        exec(cmd, function(error, stdout, stderr) {
          if(error) {
            log.error(error, "Error executing command");
            if(stderr) {
              channel.send('```' + stderr + '```');
            } else {
              channel.send('Command failed! (no data to show)');
            }
          } else {
            if(stdout) {
              channel.send('```' + stdout + '```');
            } else {
              channel.send('Command sent succesfully! (no data to show)');
            }
          }
        });
      } else {
        channel.send("Sorry, " + slack.users[message.user].name + " does not have permission to control me. :(");
      }

    }
  } catch(err) {
    log.error(err, 'Error while executing request!');
  }

});

slack.on('error', function (error) {
  log.error({error: error}, "Error in Slack comms!");
});

// Login to Slack, the callbacks will be called when needed
slack.login();
