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

const {notice} = require('../../models/index');

const {getPagination, getPagingDataCount, getPagingData} = require('../../controller/pagination')


router.use((req, res, next)=>{
    res.locals.user = req.user;
    next();
});

// 공지사항 전체 목록
router.get("/list", async (req, res, next) => {
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let cri = {currentPage};

    let noticeAndCountLists =
        await notice.findAndCountAll({
            raw: true,
            order: [
                ["regdate", "DESC"]
            ],
            limit, offset
        });

    const {count:totalItems, rows:noticeLists} = noticeAndCountLists
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    // userHeader에 들어갈거
    let searchkeyword = "";

    res.render("user/board/notice", {
        noticeLists,
        cri,
        pagingData
    });
});

// 공지사항 게시글 읽기
router.get("/detail/:no", async (req, res, next) => {
    const {no} = req.params;
    let notices =
        await notice.findOne({
            raw: true,
            where: {
                no
            }
        });

    let searchkeyword = "";

    res.render("user/board/noticeDetail", {notices, searchkeyword});
});


module.exports = router;