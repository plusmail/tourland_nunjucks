/// 여행 후기 게시글 등록하기
const exp = require("constants");
const util = require("util");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'displayFile/event/')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // 파일 확장자
        cb(null, '/' + path.basename(file.originalname, ext) + '-' + Date.now() + ext); // 새 파일명(기존 파일명 + 시간 + 확장자)} else
    },
    limits: {
        filesize: 30 * 1024 * 1024
    }, // 30KB
})

exports.upload = multer({storage: storage});

exports.uploadMultiFiles = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        console.log("uploadMulti----->", req.body.boardtype);
        cb(null, 'displayFile/' + req.body.boardtype);
      },
      filename(req, file, done) {
        const ext = path.extname(file.originalname);
        const fileName = `${path.basename(
            file.originalname,
            ext
        )}_${Date.now()}${ext}`;
        done(null, fileName);
      }
    }),
    fileFilter : (req, file, cb) => {
      const typeArray = file.mimetype.split('/');
      const fileType = typeArray[1];
  
      if (fileType == 'jpg' || fileType == 'png' || fileType == 'jpeg' || fileType == 'gif' || fileType == 'webp') {
        req.fileValidationError = null;
        cb(null, true);
      } else {
        req.fileValidationError = "jpg,jpeg,png,gif,webp 파일만 업로드 가능합니다.";
        cb(null, false)
      }
    },
    limits : { fileSize: 5 * 1024 * 1024 },
  });
  
// exports.uploadFilesMiddleware = util.promisify(uploadMultiFiles);
