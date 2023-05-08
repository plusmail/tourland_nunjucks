const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Serializer = require('sequelize-to-json')
const Op = sequelize.Op;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const {QueryTypes, where} = require("sequelize");
const moment = require("moment");
const {isLoggedIn, isNotLoggedIn, previousUrl} = require('../../middlewares');

const bodyParser = require('body-parser');
const parser = bodyParser.urlencoded({extended: false});

const {planboard} = require('../../models');
const {getPagination, getPagingDataCount, getPagingData} = require('../../controller/pagination')

router.use((req, res, next)=>{
    res.locals.user = req.user;
    next();
});

router.use(previousUrl);

//-------------------------------------상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 --------------------------------------------------
// 상품 문의 사항
router.get('/list', async (req, res, next) => {
    const contentSize = 8 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    const listAndCounts =
        await planboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const {count:totalItems, rows: listCounts} = listAndCounts;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let searchkeyword = "";

    res.render('user/board/planboardlist', {
        listCounts,
        pagingData,
        searchkeyword
    });
})

// 상품 문의 사항 글 눌러서 보기
router.get('/detail/:id', async (req, res, next) => {
    const { id } = req.params;
    const {currentPage} = req.query;

    let plans = await planboard.findOne({
            raw: true,
            where: {
                id
            }
        });
    console.log('----게시글보기====', plans);

    let searchkeyword = "";

    res.render('user/board/planboardDetail', {plans, currentPage, searchkeyword });
})

// 상품 문의사항 글 등록하는 화면임
router.get('/add', (req, res, next) => {

    let searchkeyword = "";

    res.render('user/board/planboard', {searchkeyword});
})

// 상품 문의 사항 등록하기
router.post('/add', async (req, res, next) => {
    let searchkeyword = "";
    const { title, content, username, userid, lcate, mcate} = req.body;

    console.log("plan/add-------1>", req.body);
    console.log("plan/add -----2>", title, content, username, userid, lcate, mcate);

    const PlanRegister = await planboard.create({
        raw: true,
        title,
        content,
        username,
        lcate,
        mcate,
        answer: 0,

    });

    if(PlanRegister){
        return res.status(200).json({"msg":"success"});
    }else{
        return res.status(400).json({"msg":"failed"});

    }
 
});



module.exports = router;