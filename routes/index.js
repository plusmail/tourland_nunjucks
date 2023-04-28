const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Op = sequelize.Op;


const cookieParser = require("cookie-parser");
const models = require('../models/index');

const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto');
const {sessionCheck, sessionEmpCheck} = require('../controller/sessionCtl');
const {hashPassword, validatePassword} = require('../controller/passwordCheckUtil');
const jwt = require("jsonwebtoken");
let {userAuth} = require("../controller/userData");
const bcrypt = require("bcrypt");

require('dotenv').config({ path: '.env' });



/* GET home page. */
router.get('/', async function (req, res, next) {
    res.redirect('/customer');
});


router.get('/displayFile/:whichOne', async  (req, res, next) => {
    const choice = req.params.whichOne;
    const query = req.query.filename;
    const base_dir = "displayFile/";

    let path;
    if( choice === "popup"){
        path = base_dir + "/popup" + query;
    }
    if ( choice === "banner"){
        path = base_dir + "/banner" + query;
    }
    if ( choice === "event"){
        path = base_dir + "/event" + query;
    }
    // if ( choice === "eventUpload"){
    //     path = base_dir + "/upload/" + query;
    // }
    if ( choice === "product" || (choice === "productSmall")){
        path = base_dir + "/product" + query;
        // console.log("10000000000000000000");
    }
    if ( choice === "practice"){
        path = base_dir + "/practice" + query;
    }
    fs.exists(path, (exists) =>{
        console.log("파일존재 확인->",exists);
        if(exists){

            fs.readFile(path, (err, data)=>{
                if(err){
                    throw err;
                }
                else{
                    fs.createReadStream(path).pipe(res);
                }
            })
        }else{
            fs.readFile(base_dir + "/noimage.jpg", (err, data)=>{
                fs.createReadStream(base_dir + "/noimage.jpg").pipe(res);
            })
        }
    } )

});



// 로그인 폼
router.get('/loginForm', async (req, res, next) => {

    let error = "";
    let searchkeyword = "";


    res.render("user/LoginForm", {
        userAuth,
        searchkeyword,
        error
    });
});

// 로그인 전송
router.post('/loginForm', async (req, res, next) => {

    let {userid, pass} = req.body;

    let searchkeyword = "";
    const user = await models.user.findOne({ where : {userid : userid} });
    const validPassword = await validatePassword(pass, user.userpass);
    if (!validPassword) return next(new Error('Password is not correct'))
    const accessToken = jwt.sign({ userId: user.userid }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
    await models.user.update(
        { accessToken:accessToken },
        {where : {id: user.id}}
    );

    res.status(200).json({
        "responseText":"loginsuccess",
        data: { user: user.email, role: user.role },
        accessToken
    })

});


router.get("/logout", (req, res, next)=>{

    req.session.destroy();
    console.log(`session을 삭제하였습니다.`);
    res.redirect("/customer");
});


// 회원가입
router.get('/Register', function (req, res, next) {

    let autoNo = "";

    let userVO = {};

    let Auth = null;
    let login = "";

    let msg = `세션이 존재하지 않습니다.`
    if (req.session.user) {
        msg = `${req.session.user.User}`;
        Auth = {username: req.session.user.User};
        login = req.session.user.login;
    }

    console.log("userAuth->", userAuth);

    let Manager = {};
    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;

    res.render("user/RegisterForm", {userAuth, searchkeyword, userVO});
});

// 회원가입 전송
router.post('/Register', async (req, res, next) => {
    let query;
    console.log("register->", req.body);

    try{
        const {
            username,
            userbirth,
            usertel,
            useraddr,
            userauth,
            userid,
            userpass,
            userpass2,
            postcode,
            detailAddress,
            extraAddress
        } = req.body;

        // Check if the email is already in use
        let userExists = await models.user.findOne({
            raw: true,
            where: {
                userid: userid
            }
        });

        if (userExists) {
            res.status(401).json({"responeTxt": "User ID is already in use."});
            return;
        }
        const hashedPassword = await hashPassword(userpass);
        const newUser = new models.user({
            username,
            userbirth,
            usertel,
            userauth,
            userid,
            userpass : hashedPassword,
            postcode,
            useraddr,
            detailAddress,
            extraAddress,
            role : 'customer'
        })

        const accessToken = jwt.sign({ userId: newUser.userid }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
        await newUser.save().then(anotherTask => {
            res.status(200).json({
                "responseTxt": "registersuccess",
                data: newUser,
                accessToken
            })
        }).catch(error => {
            res.status(401).json({"responeTxt":"registerfailed"});
        });
    }catch (error) {
        next(error)
    }

});

router.get('/idCheck/:userid', async (req, res, next) => {

    const userid = req.params.userid;

    try {
        let checkUserid = await models.user.findOne({
            raw: true,
            attributes: ['userid'],
            where: {
                userid: userid
            }
        })

        if (checkUserid != null) {
            console.log("check->", checkUserid.userid);
            if (checkUserid.userid != null) {
                res.status(200).send("exist");
            }
        } else {
            res.status(200).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});

module.exports = router;
