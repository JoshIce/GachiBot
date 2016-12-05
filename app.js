var express = require('express');
var nunjucks = require('nunjucks');
var session = require('express-session')
var flashy = require('express-flashy')
var formidable = require('express-formidable');
var CronJob = require('cron').CronJob;
var path = require('path');
var fs = require('fs');
var config = JSON.parse(
	fs.readFileSync('config.json')
);
var app = express();
nunjucks.configure('templates', {
	autoescape: true,
	express: app,
	watch: true
});
app.use('/', express.static('public'));
app.use(formidable({
	uploadDir: 'sounds/',
  keepExtensions: true,
}));
app.use(session({
	secret: config.secret
}));
app.engine('njk', nunjucks.render);
app.set('view engine', 'njk')
app.use(flashy());

var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file);

    });

    return results;

};

//TODO: Possibly use CronJobs to scan the directory every two minutes (probably bad)
new CronJob('2 * * * *', function() {
  console.log('You will see this message every two minutes');
}, null, true, 'America/Los_Angeles');

//TODO: convert all files to .dca format for faster playback (https://github.com/nstafie/dca-rs)
app.post('/upload', (req, res) => {
	if (!(req.files.file.name == "") && req.fields['command'].length > 0) {
		var currentFiles = _getAllFilesFromFolder("sounds/");
		var fileExists = false;
		for (var i=0; i < currentFiles.length; i++){
			if (currentFiles[i].split(".")[0].replace("sounds//", "").toLowerCase() == req.fields['command'].toLowerCase()) {fileExists = true};
		};
		if (fileExists) {
			fs.unlink(req.files.file.path);
			res.redirect('/fileexists');
		} else {
			var nameext = req.files.file.path.split(".")
			var newFileName = (req.fields['command'].toLowerCase()) + "." + (nameext[1].toLowerCase());
			fs.rename(req.files.file.path, 'sounds/' + newFileName);
			res.redirect('/success');
		};
	} else {
		res.redirect('/missinginfo')
		fs.unlink(req.files.file.path);
	}
});

app.get('/fileexists', function(req, res) {
	req.flashy('error', "Command already exists. Choose a different name.");

	res.redirect('/');
});

app.get('/missinginfo', function(req, res) {
	req.flashy('error', "No file selected or no name provided. Make sure to choose a name and a file for your command.");

	res.redirect('/');
});

app.get('/success', function(req, res) {
	req.flashy('success', "File successfully uploaded!");

	res.redirect('/');
});

app.get('/',function(req,res){
  res.render(path.join(__dirname+'/templates/index.njk'));
  //__dirname : It will resolve to your project folder.
});

app.listen(80, function() { console.log('listening'); });
