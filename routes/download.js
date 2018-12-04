
const path = require('path');
const fs = require('fs');

exports.downloads = function (req, res) {
    const directoryPath = path.join(__dirname, '../public/zip');
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        var dataFile=[];
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function(file){
            dataFile.push(file);
        })

        res.render('downloads.ejs',{data:dataFile});
    
    });
  
};