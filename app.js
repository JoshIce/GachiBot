var express = require('express');
var nunjucks = require('nunjucks');
var session = require('express-session')
var flashy = require('express-flashy')
var formidable = require('express-formidable');
var CronJob = require('cron').CronJob;
var path = require('path');
var fs = require('fs')
require('./sensitive.js')
var app = express();
nunjucks.configure('templates', {
	autoescape: true,
	express: app
});
app.use('/', express.static('public'));
app.use(formidable({
	uploadDir: 'sounds/',
  keepExtensions: true,
}));
app.use(session({
	secret: MySecret
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

//TODO: I FORGOT
new CronJob('2 * * * *', function() {
  console.log('You will see this message every two minutes');
}, null, true, 'America/Los_Angeles');

//TODO: convert all files to .dca format for faster playback (https://github.com/nstafie/dca-rs)
app.post('/upload', (req, res) => {
	if (!(req.files == {})) {
		var nameext = req.files.file.path.split(".")
		var currentFiles = _getAllFilesFromFolder("sounds/");
		var fileExists = false;
		for (var i=0; i < currentFiles.length; i++){
			if (currentFiles[i] == req.files.file.path) {fileExists = true};
		};
		if (fileExists) {
			res.redirect('/flashy');
		} else {
			var newFileName = (req.fields['command'].toLowerCase()) + "." + (nameext[1].toLowerCase());
			fs.rename(req.files.file.path, 'sounds/' + newFileName);
			res.redirect('/');
		};
	}
});

app.get('/flashy', function(req, res) {
	req.flashy('info', 'Flash messages made simple!');

	res.redirect('/');
});

app.get('/',function(req,res){
  res.render(path.join(__dirname+'/templates/index.njk'));
  //__dirname : It will resolve to your project folder.
});

app.listen(80, function() { console.log('listening'); });
