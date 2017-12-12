var exec = require('child_process').exec;
const stripAnsi = require('strip-ansi');

var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var bot_token = process.env.SLACK_TOKEN || '';

var rtm = new RtmClient(bot_token, {
  logLevel: 'error',
  dataStore: new MemoryDataStore()
});

var botName = process.env.BOT_NAME || 'kontenabot';
var botKeyword = botName + ':';

console.log('Waiting for keyword "' + botKeyword + '"')

// Setup crude way to allow only specified users
allowChecker = function(user) {
  return true;
}
var allowedUsers = [];
if(process.env.ALLOWED_USERS) {
  allowedUsers = process.env.ALLOWED_USERS.split(',');
  allowChecker = function(userId) {
    var user = rtm.dataStore.getUserById(userId);
    if(allowedUsers.lastIndexOf(user.name) != -1) {
      return true;
    }
    return false;
  }
}

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

var pty = require('node-pty');

// Emitted when there's a message on a channel where the bot is participating
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  try {
    if(message.text.lastIndexOf(botKeyword, 0) === 0) {
      if (allowChecker(message.user)) {
        cmd = "kontena " + message.text.substring(botKeyword.length);
        var term = pty.spawn('kontena', message.text.substring(botKeyword.length).trim().split(' '), {
          name: 'xterm-color',
          cols: 200,
          rows: 50,
          cwd: process.env.HOME,
          env: process.env
        });
        // Send typing notification to indicate that the work is ongoing
        const intervalObj = setInterval(() => {
          rtm.sendTyping(message.channel);
        }, 2000);
        // Collect all output data to an array
        output = []
        term.on('data', function(data) {
          // Strip out color codes etc.
          out = stripAnsi(data)
          output.push(out);
        });
        // When the spawned process exits
        term.on('exit', function(code, signal) {
          // Strip out output rows that look like plain spinner
          msg = output.filter(function(e) {
            return !/^[\b|\r]+[\s\S]*[\\|\|\/|\-|\r]+$/.test(e);
          });
          clearInterval(intervalObj);
          rtm.sendMessage('```' + msg.join('') + '```', message.channel);
        });

      } else {
        rtm.sendMessage("Sorry, " + rtm.dataStore.getUserById(message.user).name + " does not have permission to control me. :(", message.channel);
      }

    }
  } catch(err) {
    rtm.sendMessage("Oops, something went wrong during command execution:" + err, message.channel);
    console.log('Error while executing request!' + err);
  }
});

rtm.start();

