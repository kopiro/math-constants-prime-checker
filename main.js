const fs = require('fs');
const path = require('path');

// Zips of constants: http://www.numberworld.org/constants.html

const CACHE_DIR = __dirname + '/cache';

const NUMBER_ZIP_REMOTE_FILE = 'http://www.numberworld.org/constants/E%20132877206%20Hexadecimal%20Digits.zip';
const number_zip_file = path.join(CACHE_DIR, 'euler.zip');

function getNumberTxtStream(callback) {
	if (fs.existsSync(number_zip_file)) {

		console.log('Parsing ZIP...');

		fs.createReadStream(number_zip_file)
		.pipe(require('unzip').Parse())
		.on('entry', function (entry) {
			var fileName = entry.path;
			if (/$\.txt/.test(fileName)) {
				callback(entry);
			} else {
				entry.autodrain();
			}
		});

	} else {

		console.log('Download ZIP file...');

		let total_bytes = 0;
		let received_bytes = 0;
		let percentage = 0;

		require('request')
		.get(NUMBER_ZIP_REMOTE_FILE)
		.on('response', function(data) {
			total_bytes = parseInt(data.headers['content-length']);
			console.log('File has size: ' + (total_bytes / (1024*1024)).toFixed(2) + 'MB');
		})
		.on('data', (chunk) => {
			received_bytes += chunk.length;
			let _percentage = ((received_bytes * 100) / total_bytes).toFixed(2);
			if (percentage != _percentage && percentage % 5 === 0) {
				console.log(percentage + "%");
			}
			percentage = _percentage;
		})
		.on('close', () => {	
			getNumberTxtStream(callback);
		})
		.pipe(fs.createWriteStream(number_zip_file));
	}
}

getNumberTxtStream((number_stream) => {


});