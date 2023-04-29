
/// 여행 후기 게시글 등록하기
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'displayFile/event/')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);  // 파일 확장자
        cb(null, '/' + path.basename(file.originalname, ext) + '-' + Date.now() + ext); // 새 파일명(기존 파일명 + 시간 + 확장자)} else
    },
    limits : { filesize : 30 * 1024 * 1024 }, // 30KB
})

exports.upload = multer({storage : storage});



const storageMultifiles = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join(`${__dirname}/../../upload`));
    },
    filename: (req, file, callback) => {
      const match = ["image/png", "image/jpeg"];
  
      if (match.indexOf(file.mimetype) === -1) {
        var message = `<strong>${file.originalname}</strong> is invalid. Only accept png/jpeg.`;
        return callback(message, null);
      }
  
      var filename = `${Date.now()}-${file.originalname}`;
      callback(null, filename);
    }
  });
  
  const uploadFiles = multer({ storage: storageMultifiles }).fields("multi-files", 10);
  const uploadFilesMiddleware = util.promisify(uploadFiles);