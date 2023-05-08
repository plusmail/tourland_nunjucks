const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config({ path: ".env" });
const cors = require("cors");
const { user, sequelize } = require("./models/index"); // 시퀄라이즈
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const nunjucks = require("nunjucks");
const moment = require('moment');
const dateFilter = require('nunjucks-date-filter');
const numeralFilter = require('nunjucks-numeral-filter');

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/indexApi");
const userRoutes = require("./routes/userRoutes/userRoutes");
const managerRoutes = require("./routes/managerRoutes/managerRoutes");
const noticeRouter = require("./routes/board/notice.js");
const faqRouter = require("./routes/board/faq.js");
const planRouter = require("./routes/board/plan.js");



const bodyParser = require("express");
const FileStore = require("session-file-store")(session);
const passport = require("passport");
const passportConfig = require("./passport");

const app = express();

//passport local, kakao 실행
passportConfig();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
const env = nunjucks.configure("views", {
  express: app,
  watch: true,
  autoescape: true,
});

env.addFilter('date', function(date, format) {
  return moment(date).format(format);
});

env.addFilter('numeral', numeralFilter);

env.addGlobal("jsonify", function (str) {
  return JSON.stringify(str);
});

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser("1234"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);





//passport 초기화 및 세션사용
app.use(passport.initialize());
app.use(passport.session());




// sequelize.sync({ force: false })
// 서버 실행시마다 테이블을 재생성할건지에 대한 여부
//     .then(() => {
//       console.log('데이터베이스 연결 성공');
//     })
//     .catch((err) => {
//       console.error(err);
//     });

//Route 등록
app.use("/", indexRouter);
app.use(
  "/api",
  cors({
    origin: true,
    credentials: true,
  }),
  apiRouter
);


app.use("/customer", userRoutes);
app.use("/manager", managerRoutes);
app.use("/notice", noticeRouter);
app.use("/faq", faqRouter);
app.use("/plan", planRouter);





// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  //   res.local.user = null;
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
