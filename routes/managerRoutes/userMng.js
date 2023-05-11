const express = require('express');
const {getPagination, getPagingDataCount} = require("../../controller/pagination");
const {user, coupon, usercoupon} = require("../../models");
const sequelize = require("sequelize");
const path = require("path");
const router = express.Router();
const Op = sequelize.Op;
const literal = sequelize.literal;

router.use((req, res, next)=>{
    res.locals.basedir = "/manager/userMng";
    next();
});

//----------------------------- 고객관리 ---------------------------------------
// 고객 관리 전체 목록
router.get('/userMngList', async (req, res, next) => {
    let {alllist, usersecess, searchType, keyword} = req.query;

    console.log("userMngList->", alllist, usersecess, searchType, keyword);

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    if( usersecess === undefined) usersecess = 1;
    if( alllist === undefined) alllist = "false";

    let s = null;
    if( alllist === "true"){
        s = {
            where: {
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
        }
    }else{
        s = {
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
        }

    }

    let listAndCounts = await user.findAndCountAll(s);

    const {count:totalItems, rows: lists} = listAndCounts;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/user/userMngList", {alllist, cri, lists,  pagingData, usersecess});
});

// 고객 정보 상세 보기
router.get('/userDetailForm/:id', async (req, res, next) => {
    const id = req.params.id;
    let {alllist, currentPage, searchType, keyword} = req.query;
    console.log("userDetailForm--->", req.params.id);

    let userVO = await user.findOne({
        raw: true,

        where: {id: id}
    })

    let dataAndCountAll = await usercoupon.findAndCountAll({
        raw: true,
        nest : true,
        include: [
            {
                model: coupon,
                attributes: ['cno', 'cname', 'pdate', 'edate','ccontent','mrate'],
                as: 'cno_coupon',
                nest: true,
                paranoid: true,
                required: false,
            }],
        where: {userno: userVO.id}
    })

    let {count, rows:couponLists} = dataAndCountAll;
    delete userVO.userpass;
    let cri = {};

    res.render("manager/user/userDetailForm", {alllist, userVO, couponLists, cri});
});



// id check
router.get('/idCheck/:userid', async (req, res, next) => {

    const userid = req.params.userid;

    try {
        let checkUserid = await user.findOne({
            raw: true,
            attributes: ['userid','usersecess'],
            where: {
                userid: userid
            }
        })

        console.log("idCheck---->", checkUserid);

        if (checkUserid !== null){
            console.log("check->", checkUserid.userid);
            if (checkUserid.userid != null) {
                res.status(201).send("exist");
            }
            else if(checkUserid.usersecess == 0) {
                res.status(202).send("usersecess");
            }else{
                
            }
        }else{
            res.status(200).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});


// 회원정보 수정
router.post('/userInfoUpdate/:userid', async (req, res, next) => {

    const userid = req.params.userid;
    const {username,userbirth,usertel,useraddr}= req.body;
    console.log("userInfoUpdate----1>",  useraddr);
    try {
        let checkUserid = await user.findOne({
            raw: true,
            attributes: ['userid','usersecess'],
            where: {
                userid: userid
            }
        });

        if (checkUserid !== null){
            await user.update(
                {
                    username,
                    userbirth,
                    usertel,
                    useraddr
                },{
                    where: {
                        userid: userid
                    }
                }
            ).then((data)=>{
                res.status(200).json({"msg":"success"});
            }).catch((error)=>{
                res.status(400).json({"msg":"fail"});
            })
        }else{
            res.status(500).send("notexist");
        }
    

    } catch (e) {
        console.error(e);
        next(e);
    }

 

});







module.exports = router;
