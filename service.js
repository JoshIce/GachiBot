var Service = require('node-windows').Service;
 
// Create a new service object
var svc = new Service({
	name:'GachiBot',
	description: 'The server for GachiBot',
	script: './gachibot.js'
});
 
// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install',function(){
	console.log('Install complete.');
	console.log('Starting service..');
	svc.start();
	console.log('Service started.');
});

svc.on('uninstall',function(){
	console.log('Uninstall complete.');
});
 
if (process.argv[2] == 'install') {
	svc.install();
} else if (process.argv[2] == 'uninstall'){
	svc.uninstall();
} else {
	console.error('Invalid argument passed');
	console.log('Usage: service.js {install|uninstall}');
}
