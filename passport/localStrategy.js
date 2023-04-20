const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const {user} = require('../models');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pass',
        passReqToCallback: false,
        viewedProducts: [],
    }, async (userid, password, done) => {
        try {
            const exUser = await user.findOne({ where: { userid:userid } });
            // console.log("localS1111111->", exUser);
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.userpass);
                if (result) {

                    done(null, exUser);
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