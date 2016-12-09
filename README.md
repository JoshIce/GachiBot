gachi-bot is a Discord bot that allows you to upload and play custom sounds on your Discord server.

## Requirements

You will need [Node](https://nodejs.org/en/).

Make sure you have [ffmpeg](https://ffmpeg.org/download.html) and have it [added to your path](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg).

## Installation
Clone the git repository into a folder named gachi-bot.

cd to the gachi-bot folder and run `npm install`

Create a file called `config.json` in your gachi-bot directory.

Then put this in your `config.json` file:

```
{
  "secret" : "SECRET",
  "token" : "TOKEN"
}
```

Where SECRET is any string that only you have access to (this is for the web server)
and TOKEN is the token for your discord bot.

Save your config.json file.

Now simply run `node gachibot.js` in your gachi-bot directory, and the bot should run.

## Usage

You are running a web server, so `localhost` on your machine should bring you to the website you will use to upload your audio files.

Once you have uploaded an audio file, and given it a command name, you will be able to use `![name of your command]` to play your audio file.

Example: I upload an audio file and give it the command name `test`. Then in discord I use `!test` to play the file.
