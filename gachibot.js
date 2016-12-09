const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
var config = JSON.parse(
	fs.readFileSync('config.json')
);
var winston = require('winston')
var CronJob = require('cron').CronJob;
winston.add(winston.transports.File, {filename: 'log.log' });
winston.remove(winston.transports.Console)
const prefix = "!";
//TODO: Create a queue for
var playQueue = [];

client.on('error', (m) => {
	console.log("[ERROR]", m);
	winston.log("[ERROR]", m);
});
client.on("debug", (m) => {console.log("[debug]", m); });
client.on("warn", (m) => {console.log("[warn]", m); });

// var eventify = function(arr, callback) {
//     arr.push = function(e) {
//         Array.prototype.push.call(arr, e);
//         callback(arr);
//     };
// };

var async = {};
async.forEach = function(o, cb) {
  var counter = 0,
    keys = Object.keys(o),
    len = keys.length;
  var next = function() {
    if (counter < len) cb(o[keys[counter++]], next);
  };
  next();
};

client.on('ready', () => {
  console.log('Server Running..');
});

client.on('message', msg => {
	if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;

	let filenames = fs.readdirSync("sounds");
	var commands = {};
	for (filename of filenames) {
		let splitfile = filename.split(".")
		if (splitfile[1] != "exe") {
			commands[prefix + splitfile[0]] = splitfile[0] + "." + splitfile[1];
		}
	};

	if (msg.content.toLowerCase() === "!commands"){
		commandsMessage = "";
		Object.keys(commands).forEach(function(key) {
			commandsMessage = commandsMessage + key + "\n";
		});
		msg.author.sendMessage("Current list of commands:" + "\n" + commandsMessage);
	}
	else if (msg.content.toLowerCase() in commands){
		playQueue.push(msg.content.toLowerCase());
		if (playQueue.length == 1){
			var channel = msg.member.voiceChannel;
			if (channel instanceof Discord.VoiceChannel) {
				channel.join().then(connection => {
					playQueue.forEach(item => {
						const dispatcher = connection.playFile("sounds/" + commands[item]).on("end", () => {
							playQueue.pop();
							if (playQueue.length == 0) {
								channel.leave();
							};
						});
					});
					// channel.leave();
				});
			};
		};
	};
});

// eventify(playQueue, function(tempQueue){
// 	return;
// });

require("./app.js")

client.on('disconnect', function(erMsg, code) {
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
		client.login(config.token);
});

client.login(config.token);
