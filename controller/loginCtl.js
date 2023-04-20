const passport = require("passport");

exports.passportLogin = passport.authenticate('local',(authError, user, info) => {
    console.log("11111111", user);

}); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
