const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const {user} = require('../models');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pass',
        passReqToCallback: true,
        viewedProducts: ['null'],
    }, async (req, userid, password, done) => {
        try {
            const exUser = await user.findOne({ where: { userid:userid } });

            if (exUser) {
                const result = await bcrypt.compare(password, exUser.userpass);
                if (result) {
                    if(exUser.usersecess == false || null){
                        done(null, false, { errorCode:409, message: '탈퇴한 회원 입니다. 재 가입하세요.' });
                    }else{
                        exUser.dataValues.previousUrl = req.session.previousUrl;
                        console.log("passport----3>", exUser);

                        done(null, exUser);
                    }

                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));

};