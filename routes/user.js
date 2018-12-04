const del = require('del');
const fs = require('fs');
var XLSX = require('xlsx');
const Axios = require('axios')
var url = require('url');
var sendEmail = require('../lib/sendEmail');
const util = require('util')
var append = require('../lib/appendLogs')
var dateFormat = require('dateformat');
var tar = require('tar-fs')
global.temp;
global.dateTemp;
//-----------------------------------------------login page call------------------------------------------------------


async function requestDownload(filePath, originalName) {
    const filename = 'public/temp.txt';
    const fs_writeFile = util.promisify(fs.writeFile)

    fs_writeFile(filename, 'Hello Node.js')
        .catch((error) => {
            console.log(error)
        });
    var preText = 'Hi All, \n\nImage Downloader has been intialised for downloading the files in the attachment. '
        + 'This is an email notification that prior approval has been taken before proceeding. \n\nThanks,\nAnonymous';

    var postText = 'Hi All, \n\nImage Downloader has completed. Please check the downloads page '
        + '\n\nNote: Any download errors will be captured in the attachment.  \n\nThanks,\nAnonymous';
   // sendEmail(filePath, preText, 'Start');
    originalName = originalName.replace(/\.(xlsx|xls)$/, '');
    var now = new Date();
    var dateNow = dateFormat(now).replace(/\s/g, '_');
    dateTemp = originalName + '_' + dateNow;
    temp = 'imagesDir/' + dateTemp;
    if (!fs.existsSync(temp)) {
        fs.mkdirSync(temp);
    }
    var workbook = XLSX.readFile(filePath);



    var worksheet = workbook.Sheets[workbook.SheetNames[0]];

    var headers = {};
    var flag = false;
    if (true) {

        append('Below URLs could not be downloaded due to Internal server error', 'append.txt');

        for (z in worksheet) {
            if (z[0] === '!') continue;
            //parse out the column, row, and value
            var col = z.substring(0, 1);
            var row = parseInt(z.substring(1));
            var value = worksheet[z].v;

            //store header names
            if (row == 1) {
                headers[col] = value;
                continue;
            }
            console.log(col + ' : ' + row + ' : ' + value);
            global.dir;
            if (col === 'A') {
                dir = temp + '/' + value;

                if (fs.existsSync(dir)) {
                    console.log('file already exists, cannot cache this file.');
                } else {
                    fs.mkdirSync(dir);
                }
            } else {
                var re = new RegExp("(http[s]?:\/\/)?([^\/\s]+\/)(.*)");
                if (re.test(value)) {
                    console.log("Valid");
                    var destFile = value.substring(value.length - 5, value.length);
                    await downloadImage(value, dir + '/').catch(err => {
                        append('Style: ' + dir.split('/').pop() + ' : ' + value, 'append.txt');
                        console.log('failed ', err); // { error: 'url missing in async task 2' }
                        return err;
                    });
                } else {
                    console.log("Invalid");
                }
            }
            flag = true;
        }
        console.log(flag);
        await zipFile(temp, 'public/zip/' + dateTemp);
        console.log('all done')
        del.sync(filePath);
        del.sync('public/temp.txt');
       // sendEmail('append.txt', postText, 'Completed');
    }

};
async function zipFile(temp, dateTemp) {
    tar.pack(temp).pipe(fs.createWriteStream(dateTemp + '.tar'))
    console.log('EXCELLENT');
}


async function imageScrape(filePath, fileName) {
    requestDownload(filePath, fileName)
}





async function downloadImage(file_url, DOWNLOAD_DIR) {

    var file_name = url.parse(file_url).pathname.split('/').pop();
    // axios image download with response type "stream"
    const response = await Axios({
        method: 'GET',
        url: file_url,
        responseType: 'stream'
    })
    console.log(response.status);
    if (response.status === 200) {
        // pipe the result stream into a file on disc
        response.data.pipe(fs.createWriteStream(DOWNLOAD_DIR + file_name))
    }

    // return a promise and resolve when download finishes
    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve()
        })
        response.data.on('error', () => {
            reject()
        })
    })

}










module.exports = imageScrape;