const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
var config = JSON.parse(
	fs.readFileSync('config.json')
);
const prefix = "!";
//TODO: Create a queue for
var playQueue = [];
var channel = null;
var validCommands = {};

client.on('error', (m) => {
	console.log("[ERROR]", m);
});
client.on("debug", (m) => {console.log("[debug]", m); });
client.on("warn", (m) => {console.log("[warn]", m); });
process.on("unhandledRejection", (reason, promise) => {
	console.log("Promise " + promise + " rejected because " + reason);
	console.trace();
});

// var eventify = function(arr, callback) {
//     arr.push = function(e) {
//         Array.prototype.push.call(arr, e);
//         callback(arr);
//     };
// };

// TODO Normalize the levels of all audio files in sounds folder
// Convert them to mp3s: http://stackoverflow.com/questions/40233300/how-to-change-mp3-file-to-wav-file-in-node-js
// Normalize all mp3s: https://davidwalsh.name/normalize-directory-mp3s

client.on('ready', () => {
	client.user.setGame('Memes');
  console.log('Server Running..');
});

var queueExists = false;

// class PlayQueue {
// 	constructor(connection, guild) {
// 		this.connection = connection;
// 		this.guild = guild;
// 	}
// }

function handlePlayQueue(connection)
{
	//just in case...
	if (playQueue.length == 0)
	{
		console.log("debug", "handlePlayQueue called with playQueue of length 0");
		return;
	}

	currentCommand = playQueue[0];
	const dispatcher = connection.playFile("sounds/" + validCommands[currentCommand]).on("end", () => {
		playQueue.pop();
		if (playQueue.length == 0) {
			queueExists = false;
			if (channel != null){
				channel.leave();
				channel = null;
			}
		}
		else
		{
			handlePlayQueue(connection);
		}
	}).on("debug", info => {
		console.log("[debug]", info);
		return;
	}).on("error", error => {
		console.error("[ERROR]", error);
		handlePlayQueue(connection);
	});
}

client.on('message', msg => {
	if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;

	let filenames = fs.readdirSync("sounds");
	//	TODO shouldnt update this EVERY time
	//	use chokidar to watch the sounds directory
	//	https://davidwalsh.name/node-watch-file
	validCommands = {};
	for (filename of filenames) {
		let splitfile = filename.split(".")
		if (splitfile[1] != "exe") {
			validCommands[prefix + splitfile[0]] = splitfile[0] + "." + splitfile[1];
		}
	};

	command = msg.content.toLowerCase();

	if (command === "!commands"){
		msg.author.sendMessage("Go to http://crafty.servegame.com/commands for a list of commands.");
	}

	if (command === "!skip") {
		if (channel != null) {
			channel.leave();
			channel = null;
		}
		playQueue = [];
	}

	if (msg.author.id === msg.guild.ownerID) {
		if (msg.content.includes(" ")){
			var i = msg.content.indexOf(' ');
			var splits = [msg.content.slice(0,i), msg.content.slice(i+1)];
			command = splits[0];
			var targetChannel = splits[1];
			if (command in validCommands){
				if (msg.guild.channels.exists("name", targetChannel)) {
					channel = msg.guild.channels.find("name", targetChannel);
				}
			}
		}
	}

	if (command in validCommands){
		playQueue.unshift(command);
		if (!channel){ // if a channel has not already been set
			channel = msg.member.voiceChannel;
		}
		if (channel instanceof Discord.VoiceChannel) {
			if (!queueExists) {
				queueExists = true;
				channel.join().then(connection => {
					handlePlayQueue(connection);
				});
			}
		} else {
			//cant play to a nonvoice channel!
			playQueue.pop();
			channel = null;
		}
	};
});

// eventify(playQueue, function(tempQueue){
// 	return;
// });

require("./app.js")

client.on('disconnect', function(erMsg, code) {
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', erMsg, '-----');
		//client.login(config.token);
});

client.login(config.token);
