const express = require('express');
const {getPagination, getPagingDataCount} = require("../../controller/pagination");
const {user, coupon} = require("../../models");
const sequelize = require("sequelize");
const path = require("path");
const router = express.Router();
const Op = sequelize.Op;
const literal = sequelize.literal;

let basedir = "/manager/userMng";
router.use((req, res, next)=>{
    res.locals.name = "최영민";
    next();
});

//----------------------------- 고객관리 ---------------------------------------
// 고객 관리 전체 목록
router.get('/userMngList', async (req, res, next) => {
    res.locals.title = "최영민";
    let {usersecess, searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    if( usersecess === undefined) usersecess = 0;

    let listAndCounts = await user.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    usersecess
                }
            ],
            [Op.or]: [
                {
                    userid: {[Op.like]: "%" + keyword + "%"}
                },
                {
                    username: {[Op.like]: "%" + keyword + "%"}
                }
            ]
        },
        limit, offset
    })

    const {count:totalItems, rows: lists} = listAndCounts;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    let btnName = (Boolean(Number(usersecess)) ? "회원 리스트" : "탈퇴회원 조회");

    console.log("usersecbtt->", usersecess);

    res.render("manager/user/userMngList", {cri, basedir, lists, btnName, pagingData, usersecess});
});

// 고객 정보 상세 보기
router.get('/userDetailForm/:id', async (req, res, next) => {
    const id = req.params.id;
    let {currentPage, searchType, keyword} = req.query;
    console.log("userDetailForm--->", req.params.id);

    let userVO = await user.findOne({
        raw: true,

        where: {id: id}
    })

    let couponLists = await user.findOne({
        raw: true,
        nest : true,
        attributes: ['id', 'username', 'usersecess'],
        include: [
            {
                model: coupon,
                attributes: ['cno', 'cname', 'pdate', 'edate','ccontent','mrate'],
                as: 'cno_coupons',
                nest: true,
                paranoid: true,
                required: false,
            }],
        where: {id: id}
    })

    console.log("userDetailForm-1>", userVO);
    console.log("userDetailForm-2>", couponLists);

    let cri = {};

    res.render("manager/user/userDetailForm", {basedir,userVO, cri});
});








module.exports = router;
