const express = require("express");
const multer = require("multer");

const oss = require('@alicloud/oss-util');
const fs = require('fs');
const imagesearch = require('@alicloud/imagesearch20201214')
var cors = require('cors');

const app = express();
app.use(express.json());

// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

app.use(cors({
  origin: '*',
  credentials: false,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

}))
app.use(express.static(__dirname + '/public'));
/*
Thanks to https://medium.com/swlh/how-to-upload-image-using-multer-in-node-js-f3aeffb90657
https://blog.logrocket.com/uploading-files-using-multer-and-node-js/
**/
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
}) 
var upload = multer({ storage: storage })

const client = new imagesearch.default({
  accessKeyId: process.env['key'],
  accessKeySecret: process.env['secret'],
  type: "access_key",
  endpoint: "imagesearch.ap-southeast-1.aliyuncs.com",
  regionId: "ap-southeast-1",
  protocol: 'http'});

async function aiImageSearch(pic) {
  const searchImageByPicAdvanceRequest = new imagesearch.SearchImageByPicAdvanceRequest({
      instanceName: "search1anabul",
      picContentObject: pic,
      categoryId: 88888888,
      num: 1,
      start: 0,
      crop: true,
      // filter: "int_attr=56 AND str_attr=\"test\""
    })  
  let ossRuntime = new oss.RuntimeOptions({});
  const searchImageByPicResponse = await client.searchImageByPicAdvance(searchImageByPicAdvanceRequest, ossRuntime);
  let imageResults = (searchImageByPicResponse.body.auctions[0].customContent)
  console.log(searchImageByPicResponse.body.auctions[0])
  return imageResults
  }

app.get('/', )  
app.post("/ai-image-search", upload.array("files"), async function uploadFiles(req, res) {
  let pic = fs.createReadStream(req.files[0].path)
  let imageResult = await aiImageSearch(pic)
  console.log(req.files)
  return res.json(imageResult)
}); 
app.listen(5000, () => {
    console.log(`Server started...`);
});
 
