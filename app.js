/**
* Module dependencies.
*/

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , dwnld = require('./routes/download')
  , http = require('http')
  , path = require('path');
var lib = require('./lib/removeDir');
const del = require('del');

const multer = require('multer');
const checkFilesExist = require('check-files-exist');
var requestDown = require('./routes/user');

var app = express();
var bodyParser = require("body-parser");

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '/public')));


//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = multer.diskStorage({

  //specify destination
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },

  //specify the filename to be unique
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    console.log('File mime type is ', ext);
    //set the file fieldname to a unique name containing the original name, current datetime and the extension.
    cb(null, Date.now()+'__'+file.originalname.split(' ').join('_'));
  }
});

// development only
app.get('/', function (request, response) {
  response.render('example.ejs');
});
app.get('/downloads', dwnld.downloads);

var upload = multer({ storage: multerConfig }).array('catalog', 3);
app.post('/', function (req, res) {
  lib('imagesDir/*');
  del.sync('append.txt');
  //lib('public/zip/*');
  upload(req, res, function (err) {
    checkFilesExist('./public/uploads/*.xlsx', __dirname).then(function () {
      console.log(req.files[0].filename);
      requestDown(req.files[0].path,req.files[0].filename);
    });
  });

  res.render('success.ejs');
});

//Middleware
app.listen(3000)
