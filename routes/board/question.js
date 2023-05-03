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

const {planboard} = require('../../models');



//-------------------------------------상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 --------------------------------------------------
// 상품 문의 사항
router.get('/list', async (req, res, next) => {
    let {Auth, AuthEmp, Manager, login} = sessionCheck(req, res);
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
    const cri = {currentPage};

    let searchkeyword = "";

    res.render('user/board/tourlandPlanBoard', {
        list,
        cri,
        pagingData,
        searchkeyword
    });
})

// 상품 문의 사항 글 눌러서 보기
router.get('/tourlandPlanBoardDetail', async (req, res, next) => {
    let {Auth, AuthEmp, Manager, login} = sessionCheck(req, res);
    console.log('=---쿼리추출---', req.query);

    let plan =
        await models.planboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('----게시글보기====', plan);
    let cri = {};

    // userHeader 에서 필요한 변수들
    let searchkeyword = "";

    res.render('user/board/tourlandPlanBoardDetail', {plan, Auth, login, Manager, searchkeyword, cri});
})

// 상품 문의사항 글 등록하는 화면임
router.get('/tourlandPlanBoardRegister', (req, res, next) => {

    // userHeader 에서 필요한 변수들
    let Manager = {};
    let searchkeyword = "";
    let mypage = {};
    if (login === 'user') {
        mypage = "mypageuser"
    } else if (login === 'Manager') {
        mypage = "mypageemp"
    }
    console.log('------------------Auth누구------', Auth);


    res.render('user/board/tourlandPlanBoardRegister', {mypage, Auth, login, Manager, searchkeyword});
})

// 상품 문의 사항 등록하기
router.post('/tourlandPlanBoardRegister', async (req, res, next) => {
// userHeader 에서 필요한 변수들
    let Manager = {};
    let searchkeyword = "";

    let mypage = {};
    if (login === 'user') {
        mypage = "mypageuser"
    } else if (login === 'Manager') {
        mypage = "mypageemp"
    }

    const PlanRegister = await models.planboard.create({
        raw: true,
        title: req.body.title,
        content: req.body.content,
        writer: req.body.writer,
        regdate: req.body.regdate,
        answer: 0,

    });
    console.log('------------------게시글 등록-----------------', PlanRegister);

// ------------------상품 문의 등록하면 게시판 목록 보여줘야하므로 list값도 같이 전송해서 게시판 목록 다시 불러오기 -----------------------------------
    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list =
        await models.planboard.findAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.planboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    console.log('======데이터 전체 count 수=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------한 페이지에 나오는 데이터-', listCount);
    let cri = currentPage;


    res.render('user/board/tourlandPlanBoard', {
        PlanRegister,
        Auth,
        login,
        Manager,
        mypage,
        searchkeyword,
        list,
        pagingData,
        cri
    });
});



const {getPagination, getPagingDataCount, getPagingData} = require('../../controller/pagination')










module.exports = router;