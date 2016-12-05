const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
var winston = require('winston')
var CronJob = require('cron').CronJob;
winston.add(winston.transports.File, {filename: 'log.log' });
winston.remove(winston.transports.Console)
const prefix = "!";
var playQueue = [];

client.on('error', (m) => {
	console.log("[ERROR]", m);
	winston.log("[ERROR]", m);
});
client.on("debug", (m) => {console.log("[debug]", m); });
client.on("warn", (m) => {console.log("[warn]", m); });

var eventify = function(arr, callback) {
    arr.push = function(e) {
        Array.prototype.push.call(arr, e);
        callback(arr);
    };
};

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

new CronJob('0,2 * * * *', function() {
  console.log('You will see this message every two minutes');
}, null, true, 'America/Los_Angeles');

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
		commands[prefix + splitfile[0]] = splitfile[0] + "." + splitfile[1];
	};

	if (msg.content.toLowerCase() === "!commands"){
		commandsMessage = "";
		Object.keys(commands).forEach(function(key) {
			commandsMessage = commandsMessage + key + "\n";
		});
		msg.author.sendMessage("Current list of commands:" + "\n" + commandsMessage);
	}
	else if (msg.content.toLowerCase() in commands){
		var channel = msg.member.voiceChannel;
		if (channel instanceof Discord.VoiceChannel) {
			channel.join().then(connection => {
				const dispatcher = connection.playFile("sounds/" + commands[msg.content.toLowerCase()]).on("end", () => {
					channel.leave()
				});
			});
		};
	};
});

eventify(playQueue, function(tempQueue){
	return;
});

require("./app.js")

client.on('disconnect', function(erMsg, code) {
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
		client.login(MyKey);
});

client.login(MyKey);
