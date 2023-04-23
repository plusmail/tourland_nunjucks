const passport = require('passport');
const {user} = require('../models');
const local = require('./localStrategy');
const kakao = require('./kakoStrategy');

module.exports = () =>{
    passport.serializeUser((user,done)=>{
        done(null, user.userid);
    });

    passport.deserializeUser((userid, done) =>{
        user.findOne( {
            where : {userid},
            attributes: ['id','userid','username','role','viewedProducts', 'usersecess'],
            }
        )
        .then(user => done(null, user))
        .catch( err => done(err));


    });

    local();
    kakao();
}