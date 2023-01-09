const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Op = sequelize.Op;

const cookieParser = require("cookie-parser");
const models = require("../../models");
const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto'); //추가됐음
const {getPagingData, getPagination} = require('../../controller/pagination');
const {makePassword, comparePassword} = require('../../controller/passwordCheckUtil');
const {product} = require("../../models");
const moment = require("moment");
const bodyParser = require('body-parser');
const parser = bodyParser.urlencoded({extended: false});
const {upload} = require("../../controller/fileupload");
const {sessionEmpCheck} = require('../../controller/sessionCtl');


// ------------------------------------- 관리자 페이지 메인 -------------------------------------
router.get('/statistics', (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    console.log('-----관리자페이지메인------',);
    console.log('------Auth???-------', Auth);
    console.log('------AuthEmp-------', AuthEmp);
    res.render("manager/main/statistics", {Manager, Auth, AuthEmp, login});
});

router.get('/userlist', (req, res, next) => {

    let cri = {};
    let btnName = "";
    let list = {};

    res.render("userMngList", {cri, btnName, list});
});


//----------------------------- 고객관리 ---------------------------------------
// 고객 관리 전체 목록
router.get('/userMngList/:usersecess', async (req, res, next) => {
    //usersecess 정상회원, 탈퇴회원 구분
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    if(Manager == undefined) res.redirect("/customer");

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let dataAll = await models.user.findAll({
        where: {
            [Op.and]: [
                {
                    usersecess: usersecess
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

    let dataCountAll = await models.user.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    usersecess: usersecess
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

    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    let btnName = (Boolean(Number(usersecess)) ? "회원 리스트" : "탈퇴회원 조회");

    console.log("usersecbtt->", btnName)
    let list = dataAll;

    res.render("manager/user/userMngList", {cri, list, btnName, pagingData, Manager, usersecess, AuthEmp});
});

// ------------------------------------------------ 직원관리 --------------------------------------------------------
// 직원 관리 전체 목록
router.get('/employeeMngList/:empretired', async (req, res, next) => {
    //empretired 정상사원, 퇴사사원 구분
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    const empretired = req.params.empretired;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let dataAll = await models.employee.findAll({
        where: {
            [Op.and]: [
                {
                    empretired: empretired
                }
            ],
            [Op.or]: [
                {
                    empid: {[Op.like]: "%" + keyword + "%"}
                },
                {
                    empname: {[Op.like]: "%" + keyword + "%"}
                }
            ]

        },
        limit, offset
    })

    let dataCountAll = await models.employee.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    empretired: empretired
                }
            ],
            [Op.or]: [
                {
                    empid: {[Op.like]: "%" + keyword + "%"}
                },
                {
                    empname: {[Op.like]: "%" + keyword + "%"}
                }
            ]
        },
        limit, offset
    })

    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    let btnName = (Boolean(Number(empretired)) ? "직원 리스트" : "퇴사사원 조회");

    console.log("usersecbtt->", btnName)
    let list = dataAll;

    res.render("manager/employee/employeeMngList", {cri, list, btnName, pagingData, Manager, empretired, Auth, AuthEmp, login});
});
// 직원 상세보기
router.get('/employeeDetailForm/:empretired', async (req, res, next) => {
    //empretired 일반사원, 퇴사사원 구분
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    const empretired = req.params.empretired;
    let {no, currentPage, searchType, keyword} = req.query;

    let empVO = await models.employee.findOne({
        raw: true,

        where: {empno: no}
    })
    console.log("empid->", empVO);

    let cri = {};
    // header에서 관리자 프로필의 정보를 테스트로 고정시켜버림

    let success = "";

    res.render("manager/employee/employeeDetailForm", {empVO, cri, Manager, empretired, success, AuthEmp});
});

router.post('/employeeDetailForm/:empretired', async (req, res, next) => {
    //empretired 일반사원, 퇴사사원 구분
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    console.log("33333333333333333333");
    const {empretired, empno, empname, empbirth, emptel, empaddr, empauth, empid} = req.params;
    let {no, currentPage, searchType, keyword} = req.query;

    let empVO = await models.employee.findOne({
        raw: true,

        where: {empno: no}
    })
    console.log("empid->", empVO);

    let cri = {};
    let success = "";

    res.render("manager/employee/employeeDetailForm", {empVO, cri, Manager, Auth, empretired, success, AuthEmp});
});

// 고객 정보 상세 보기
router.get('/userDetailForm/:usersecess', async (req, res, next) => {
    //usersecess 정상회원, 탈퇴회원 구분
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    if(Manager == undefined) res.redirect("/customer");
    const usersecess = req.params.usersecess;
    let {id, userid, currentPage, searchType, keyword} = req.query;

    let userVO = await models.user.findOne({
        raw: true,

        where: {id: id}
    })
    console.log("userid->", userVO);

    let cri = {};

    let couponLists = [{}];

    res.render("manager/user/userDetailForm", {userVO, cri, Manager, AuthEmp, usersecess, couponLists});
});


// --------------------------------------------------------------- 예약 관리 ---------------------------------------------------------------
router.get('/reservationMngList', async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let noList = {};
    let yesList = {};

    const list =
        await models.reservation.findAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.reservation.findAndCountAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = {currentPage};


    res.render("manager/reservation/reservationMngList", {Manager, AuthEmp, noList, yesList, list , pagingData, cri});

});


// / ✈️ 항공관리 productfilightMngList----------------------------------------------------
// 항공 관리 전체 목록
router.get('/flightMngList', async (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, keyword} = req.query;

    const contentSize = Number(10); // 한페이지에 나올 개수
    const currentPage = Number(req.query.page) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    let querystring = null;
    let flightList = [];
    let dataCountAll = [];

    if (searchType == "id") {
        flightList = await models.airplane.findAll({
            where: {[Op.or]: [{id: {[Op.like]: keyword}},]}, limit, offset
        })

        dataCountAll = await models.airplane.findAndCountAll({
            where: {[Op.or]: [{id: {[Op.like]: keyword}}]}, limit, offset
        })
    } else if (searchType == "ano") {
        flightList = await models.airplane.findAll({
            where: {[Op.or]: [{ano: {[Op.like]: "%" + keyword + "%"}},]}, limit, offset
        })

        dataCountAll = await models.airplane.findAndCountAll({
            where: {[Op.or]: [{ano: {[Op.like]: "%" + keyword + "%"}}]}, limit, offset
        })

    } else if (searchType == "rloca") {
        flightList = await models.airplane.findAll({
            where: {[Op.or]: [{rlocation: {[Op.like]: "%" + keyword + "%"}},]}, limit, offset
        })

        dataCountAll = await models.airplane.findAndCountAll({
            where: {[Op.or]: [{rlocation: {[Op.like]: "%" + keyword + "%"}}]}, limit, offset
        })
    } else {
        flightList = await models.airplane.findAll({
            where: {}, limit, offset
        })
        dataCountAll = await models.airplane.findAndCountAll({
            where: {}, limit, offset
        })
    }

    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/flight/flightMngList2", {cri, flightList, pagingData, Manager, AuthEmp, moment});
})

// 항공 관리 페이지에서 검색 기능(국내)
router.get('/flightDomList/:currentPage', async (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, keyword} = req.query;

    console.log("6666666666->", req.query);
    let {currentPage} = req.params;

    const contentSize = Number(10); // 한페이지에 나올 개수
    currentPage = Number(currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let flightList = await models.airplane.findAll({
        where: {},
        limit, offset
    })

    let dataCountAll = await models.airplane.findAndCountAll({
        where: {},
        limit, offset
    })

    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/flight/flightMngList2", {cri, flightList, pagingData, Manager, AuthEmp});
});
// 항공 관리 페이지에서 검색 기능(해외)
router.get('/flightAbroadList/:currentPage', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, keyword} = req.query;

    console.log("6666666666->", req.query);
    let {currentPage} = req.params;

    const contentSize = Number(10); // 한페이지에 나올 개수
    currentPage = Number(currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let flightList = await models.airplane.findAll({
        where: {},
        limit, offset
    })

    let dataCountAll = await models.airplane.findAndCountAll({
        where: {},
        limit, offset
    })

    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/flight/flightMngList2", {cri, flightList, pagingData, Manager, AuthEmp});
});
//항공편 추가 페이지
router.get('/addFlightForm', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let list = await models.airplane.findAll({
        where: {},
    });
    let airTotalCnt = {};
    let airTotalNextCnt = {};

    res.render("manager/flight/addFlightForm2", {airTotalNextCnt, airTotalCnt, list, Manager, AuthEmp});
});

router.post('/addFlightForm', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let list = await models.airplane.findAll({
        where: {},
    });


    res.render("manager/flight/addFlightForm2", {list, Manager, AuthEmp});
});

router.get('/flightDetail', async (req, res, next) => {
// header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);


    let {searchType, searchType2, keyword} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, searchType2, keyword};
    let noDiv = {};
    let prevAir = {
        dlocation: "",
        rlocation: "",
        seat: "",
        capacity: "",
        ddate: "",
        ano: ""
    };
    let selectedAir = {
        dlocation: "",
        rlocation: "",
        seat: "",
        capacity: "",
        ddate: "",
        ano: ""
    };

    res.render("manager/flight/flightDetail", {Manager, Auth, cri, noDiv, prevAir, selectedAir})
});


// 🏨 호텔 관리 -------------------
// 호텔 관리 전체 목록
router.get('/hotelMngList', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    let {searchType, keyword, keyword2, keyword3} = req.query;

    const contentSize = Number(10); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await models.hotel.findAll({
        // raw : true,
        nest: true,
        attributes: ['id', 'hname', 'haddr', 'checkin', 'checkout', 'capacity', 'price', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup', 'totalcapacity', 'pdiv'],
        where: {},
        limit, offset
    });
    let dataCountAll = await models.hotel.findAndCountAll({
        where: {},
        limit, offset
    });


    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword, keyword2, keyword3};

    res.render("manager/hotel/hotelMngList", {cri, list, pagingData, Manager, AuthEmp, moment});
});
//호텔 등록
router.get('/hotelRegister', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    let lastNum = "";

    res.render("manager/hotel/hotelRegister", {lastNum, Manager, AuthEmp});
});

router.post("/hotelRegister", async (req, res, next) => {
    // header 공통 !!!
    let Manager = {};
    let Auth = {};

    const register = await models.hotel.create({
        raw: true,
        id: req.body.id,
        hname: req.body.hname,
        haddr: req.body.haddr,
        checkin: req.body.checkin,
        checkout: req.body.checkout,
        capacity: req.body.capacity,
        price: req.body.price,
        roomcapacity: req.body.roomcapacity,
        roomtype: req.body.roomtype,
        ldiv: req.body.ldiv,
        bookedup: req.body.bookedup

    })
    console.log('내용내용내용내용내용내용', register);
    console.log('파일파일파일파일파일파일', req.file);

    res.redirect("/manager/hotelMngList");
})

//호텔 수정
router.get('/hotelModify', async (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    let {searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";

    const hotelVo = await models.hotel.findOne({
        // raw : true,
        nest: true,
        attributes: ['id', 'hname', 'haddr', 'checkin', 'checkout', 'capacity', 'price', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup', 'totalcapacity', 'pdiv'],
        where: {
            id: req.query.id
        },
    });

    // console.log("666666666->", hotelVo);

    let cri = {searchType, keyword};

    res.render("manager/hotel/hotelModify", {cri, hotelVo, Manager, AuthEmp});
});

router.post("/hotelModify", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const update = await models.hotel.update({
                hname: req.body.hname,
                haddr: req.body.haddr,
                checkin: req.body.checkin,
                checkout: req.body.checkout,
                capacity: req.body.capacity,
                price: req.body.price,
                roomcapacity: req.body.roomcapacity,
                roomtype: req.body.roomtype,
                ldiv: req.body.ldiv,
                bookedup: req.body.bookedup
        },
        {
            where: {id: req.body.id}
        }
    );

    if (update != null) {
        res.status(203).json({"responseText": "modifysuccess"});

    } else {
        res.status(303).json({"responseText": "modifyfaild"});
    }
});

router.get('/hotelDelete', async (req, res, next) => {

    let hotelVO = await models.hotel.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.hotel.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.redirect("/manager/hotelMngList");
})

// 🚩 투어 관리 -------------------
// 현지 투어 관리 전체 목록
router.get('/tourMngList', async (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await models.tour.findAll({
        // raw : true,
        nest: true,
        attributes: ['id', 'tname', 'tlocation', 'startDate', 'endDate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
        where: {},
        limit, offset
    });
    let dataCountAll = await models.tour.findAndCountAll({
        where: {},
        limit, offset
    });


    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/tour/tourMngList", {cri, list, pagingData, Manager, AuthEmp, moment});
});

router.get('/tourRegister', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let no = '';

    res.render("manager/tour/tourRegister", {Manager, AuthEmp, no});
});

router.post("/tourRegister", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const register = await models.tour.create({
        raw: true,
        id: req.body.id,
        ldiv: req.body.ldiv,
        tlocation: req.body.tlocation,
        tname: req.body.tname,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        taddr: req.body.taddr,
        etime: req.body.etime,
        capacity: req.body.capacity,
        tprice: req.body.tprice
    });

    res.redirect("/manager/tourMngList");
});

router.get('/tourDetail', async (req, res, next) => {
// header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, keyword};

    const tourVO =
        await models.tour.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });


    res.render("manager/tour/tourDetail", {Manager, AuthEmp,cri,moment, tourVO})

});

router.get('/tourModify', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType,searchType2, keyword} = req.query;


    keyword = keyword ? keyword : "";
    let cri = {searchType, searchType2, keyword};

    const tourVO =
        await models.tour.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });


    res.render("manager/tour/tourModify", {Manager, AuthEmp, tourVO,cri, moment});

});

router.post("/tourModify", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const update = await models.hotel.update({
            id: req.body.id,
            ldiv: req.body.ldiv,
            tlocation: req.body.tlocation,
            tname: req.body.tname,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            taddr: req.body.taddr,
            etime: req.body.etime,
            capacity: req.body.capacity,
            tprice: req.body.tprice
        },
        {
            where: {id: req.body.id}
        }
    );

    if (update != null) {
        res.status(203).json({"responseText": "modifysuccess"});

    } else {
        res.status(303).json({"responseText": "modifyfaild"});
    }
});


router.get('/tourDelete', async (req, res, next) => {

    let tourVO = await models.tour.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.tour.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.redirect("/manager/tourMngList");
})

// 🚗 렌트카 관리-----------------
// 렌트카 관리 전체 목록
router.get('/rentcarMngList', async (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, keyword} = req.query;

    const contentSize = Number(10); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await models.rentcar.findAll({
        // raw : true,
        nest: true,
        attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
        where: {},
        limit, offset
    });
    let dataCountAll = await models.tour.findAndCountAll({
        where: {},
        limit, offset
    });


    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/rentcar/rentcarMngList", {cri, list, pagingData, Manager, AuthEmp});
});

router.get('/rentcarRegister', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    let autoNO = "";

    res.render("manager/rentcar/rentcarRegister", {Manager, AuthEmp, autoNO});
});

router.post("/rentcarRegister", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const register = await models.rentcar.create({
        raw: true,
        cdiv: req.body.cdiv,
        cno: req.body.cno,
        rentddate: req.body.rentddate,
        returndate: req.body.returndate,
        rentaddr: req.body.rentaddr,
        returnaddr: req.body.returnaddr,
        price: req.body.price,
        capacity: req.body.capacity,
        insurance: req.body.insurance,
        ldiv: req.body.ldiv
    });

    res.redirect("/manager/rentcarMngList");
});

router.get('/rentcarDetailForm', async (req, res, next) => {
// header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const rentcarVO =
        await models.rentcar.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });

    res.render("manager/rentcar/rentcarDetailForm", {Manager, AuthEmp, rentcarVO})
});

router.post("/rentcarDetailFormUpdate", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    const update = await models.rentcar.update({
            id: req.body.id,
            cdiv: req.body.cdiv,
            cno: req.body.cno,
            rentddate: req.body.rentddate,
            returndate: req.body.returndate,
            rentaddr: req.body.rentaddr,
            returnaddr: req.body.returnaddr,
            price: req.body.price,
            capacity: req.body.capacity,
            insurance: req.body.insurance,
            ldiv: req.body.ldiv
        },
        {
            where: {id: req.body.id}
        }
    );

    if (update != null) {
        res.status(203).json({"responseText": "modifysuccess"});

    } else {
        res.status(303).json({"responseText": "modifyfaild"});
    }
});

router.get('/delRentcar', async (req, res, next) => {

    let rentcarVO = await models.rentcar.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.rentcar.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.redirect("/manager/rentcarMngList");
})

// --------------------------------------------------------------- 상품 관리 --------------------------------------------
//상품 전체 목록
router.get('/productMngList', async (req, res, next) => {

    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    if(Manager == undefined) res.redirect("/customer");

    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await product.findAll({
        // raw : true,
        nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        include: [
            {
                model: models.airplane,
                attributes: ['price', 'ano'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.hotel,
                attributes: ['checkin', 'checkout', 'price', 'hname'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.tour,
                attributes: ['tprice'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.rentcar,
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
            },
        ],
        where: {},
        limit, offset
    });
    let dataCountAll = await models.product.findAndCountAll({
        where: {},
        limit, offset
    });


    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType, keyword};


    console.log("usersecbtt->")

    res.render("manager/product/productMngList", {cri, list, pagingData, Manager, AuthEmp});
});

router.get('/productDetail', async (req, res, next) => {
// header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    if(Manager == undefined) res.redirect("/customer");
    let {id, searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";

    const vo = await product.findOne({
        // raw : true,
        nest: true,
        attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        where : { id : id},
        include: [
            {
                model: models.airplane,
                attributes: ['price', 'ano', 'id', 'dlocation', 'rlocation', 'ddate', 'rdate', 'seat', 'ldiv', 'capacity'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.hotel,
                attributes: ['checkin', 'checkout', 'price', 'hname', 'id', 'haddr', 'capacity', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.tour,
                attributes: ['tprice', 'id', 'tname', 'tlocation', 'startDate', 'endDate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.rentcar,
                attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
            },
        ]
    });
    console.log("ccccccccccccc->", vo);

    let cri = {searchType, keyword};

    res.render("manager/product/productDetail", {Manager, AuthEmp,  vo, cri, moment})
});

router.get('/productModify', async (req, res, next) => {
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {searchType, searchType2, keyword, keyword2, keyword3} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, searchType2, keyword, keyword2, keyword3};

    const vo = await product.findOne({
        // raw : true,
        nest: true,
        attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        include: [
            {
                model: models.airplane,
                attributes: ['price', 'ano', 'id', 'dlocation', 'rlocation', 'ddate', 'rdate', 'seat', 'ldiv', 'capacity'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.hotel,
                attributes: ['checkin', 'checkout', 'price', 'hname', 'id', 'haddr', 'capacity', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.tour,
                attributes: ['tprice', 'id', 'tname', 'tlocation', 'startDate', 'endDate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: models.rentcar,
                attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
            },
        ]
    });

    const flightListDepature = await models.airplane.findAll({
        where: {},
    });
    const flightListRending = await models.airplane.findAll({
        where: {},
    });
    const hotelList = await models.hotel.findAll({
        where: {},
    });
    const tourList = await models.tour.findAll({
        where: {},
    });
    const rentcarList = await models.rentcar.findAll({
        where: {},
    });

    res.render("manager/product/productModify", {
        Manager,
        Auth,
        vo,
        cri,
        flightListDepature,
        flightListRending,
        hotelList,
        tourList,
        rentcarList
    });

});

router.get('/productDelete', async (req, res, next) => {

    let vo = await models.product.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.product.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.redirect("/manager/productMngList");
});

router.get("/addProductForm", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    if(Manager == undefined) res.redirect("/customer");

    let {searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, keyword};
    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const airplane_currentPage = Number(req.query.airplane_currentPage) || 1; //현재페이지
    let {limit_airplne, offset_airplne} = getPagination_airplne(airplane_currentPage, contentSize);

    let airplane_count = await models.airplane.findAndCountAll({
        nest : true,
        where: {},
        limit, offset
    });
    const pagingData_airplane = getPagingData(airplane_count, airplane_currentPage, limit);

    console.log("----->",airplane_currentPage, contentSize, limit, offset );

    const hotel_currentPage = Number(req.query.hotel_currentPage) || 1; //현재페이지
    let {limit_hotel, offset_hotel} = getPagination(hotel_currentPage, contentSize);
    let hotel_count = await models.hotel.findAndCountAll({
        where: {},
        limit_hotel, offset_hotel
    });
    const pagingData_hotel = getPagingData(hotel_count, hotel_currentPage, limit_hotel);


    const tour_currentPage = Number(req.query.tour_currentPage) || 1; //현재페이지
    const {limit_tour, offset_tour} = getPagination(tour_currentPage, contentSize);
    let tour_count = await models.tour.findAndCountAll({
        where: {},
        limit_tour, offset_tour
    });
    const pagingData_tour = getPagingData(tour_count, tour_currentPage, limit_tour);


    const rentcar_currentPage = Number(req.query.rentcar_currentPage) || 1; //현재페이지
    const {limit_rentcar, offset_rentcar} = getPagination(rentcar_currentPage, contentSize);
    let rentcar_count = await models.rentcar.findAndCountAll({
        where: {},
        limit_rentcar, offset_rentcar
    });
    const pagingData_rentcar = getPagingData(rentcar_count, rentcar_currentPage, limit_rentcar);


    const flightListDepature = await models.airplane.findAll({
        where: {},
        limit_airplane, offset_airplane
    });

    const flightListRending = await models.airplane.findAll({
        where: {},
    });
    const hotelList = await models.hotel.findAll({
        where: {},
        limit_hotel, offset_hotel
    });
    const tourList = await models.tour.findAll({
        where: {},
        limit_tour, offset_tour
    });
    const rentcarList = await models.rentcar.findAll({
        where: {},
        limit_rentcar, offset_rentcar
    });


    res.render("manager/product/addProductForm", {
        Manager,
        Auth,
        AuthEmp,
        cri,
        flightListDepature,
        flightListRending,
        hotelList,
        tourList,
        rentcarList,
        pagingData_airplane,
        pagingData_hotel,
        pagingData_tour,
        pagingData_rentcar
    });
})

router.post('/flightList/:id', async (req, res, next)=>{

    const {id} = req.params;

    console.log("7777777777777->", id);

    let cri = {searchType, keyword} = req.query;
    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이

    const {limit_airplane, offset_airplane} = getPagination(currentPage, contentSize);
    let airplane_count = await models.airplane.findAndCountAll({
        nest:true,
        where: {},
        limit_airplane, offset_airplane
    });
    const pagingData_airplane = getPagingData(airplane_count, currentPage, limit_airplane);



    const list = await models.airplane.findAll({
        raw : true,
        where: { id : id},
    });

    if(list != null){
        res.status(204).json({pagingData_airplane,list});
    }

});


// 🎁️ 이벤트 관리 ----------------------------------------------------------
// 전체 이벤트 보기
router.get("/eventMngList", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await models.event.findAll({
        raw: true,
        order: [
            ["id", "DESC"]
        ],
        limit, offset
    });

    const listCount =
        await models.event.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);

    res.render("manager/event/eventMngList", {Manager, AuthEmp, list, pagingData})
})

// 이벤트 상세보기
router.get('/eventDetailForm', async (req, res, next) => {
// header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    const eventVO =
        await models.event.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('--------이벤트 상세보기--------', eventVO)

    res.render("manager/event/eventDetailForm", {Manager, AuthEmp, eventVO})
})

// 이벤트 등록하기 화면 보이기
router.get("/eventRegister", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    let url2 = {};

    res.render("manager/event/eventRegister", {Manager, AuthEmp, url2});
})

// 이벤트 등록할 게시글 작성하고 전송하기
router.post("/eventRegister", upload.single("eventPic"), async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    const register = await models.event.create({
        raw: true,
        title: req.body.title,
        content: req.body.content,
        startdate: req.body.startdate,
        enddate: req.body.enddate,
        pic: req.file.filename

    })
    console.log('내용내용내용내용내용내용', register);
    console.log('파일파일파일파일파일파일', req.file);

    res.redirect("/manager/eventMngList")
})

// 이벤트 수정하기(전송)
router.post('/eventUpdate', upload.single("eventPic"), async (req, res, next) => {
    // header 공통 !!!

    const { Manager} = sessionEmpCheck(req ,res);

    let body = {};
    if (req.file != null) {
        body = {
            raw: true,
            title: req.body.title,
            content: req.body.content,
            startdate: req.body.startdate,
            enddate: req.body.enddate,
            pic: req.file.filename,
        }
    } else {
        body = {
            raw: true,
            title: req.body.title,
            content: req.body.content,
            startdate: req.body.startdate,
            enddate: req.body.enddate,
        }
    }

    const update = await models.event.update(body,
        {
            where: {
                id: req.body.id
            }
        });
    console.log('매니저매니저', Manager);
    console.log('---------req.body------', req.body);
    console.log('-------수정하기----------', update);

    res.redirect("/manager/eventMngList");
    // res.render("manager/event/eventDetailForm", {Manager, Auth, update, eventVO});
})


// 이벤트 삭제하기
router.delete('/deleteEvent', async (req, res, next) => {

    let eventVO = await models.event.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.event.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render("manager/board/eventMngList", {eventVO});
})

// ️------------------------------------------------ 고객센터(게시판) 관리 ------------------------------------------------
// ️ ️FAQ 게시판 보기
router.get('/FAQMngList', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list =
        await models.faq.findAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.faq.findAndCountAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = {currentPage};


    res.render("manager/board/FAQMngList", {Manager, AuthEmp, list , pagingData, cri});

})

// FAQ 등록하기 입장
router.get("/FAQRegister", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    res.render("manager/board/FAQRegister", {Manager, AuthEmp})
})

// FAQ 등록하기 전송
router.post("/FAQRegister", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);

    const faq = await models.faq.create({
        raw: true,
        title: req.body.title,
        content: req.body.content
    });
    console.log('-------FAQ 등록------', faq);

    // FAQ 메인화면 보여주기 위함
    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list =
        await models.faq.findAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.faq.findAndCountAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = {currentPage};

    res.render("manager/board/FAQMngList", {Manager, AuthEmp, faq, list, listCount, pagingData, cri})
})

// FAQ 게시글 읽기
router.get("/FAQDetail", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    console.log('-------------query??------------', req.query);
    let faq = await models.faq.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });
    console.log('-----------------FAQ읽기----------------', faq);

    let cri = {};

    res.render("manager/board/FAQDetail", {Manager, AuthEmp, faq, cri});
})

// FAQ 게시글 수정
router.get("/FAQModify", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    let cri = {};
    let faq = await models.faq.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });
    console.log('-------수정화면입장----------', faq);

    res.render("manager/board/FAQModify", {Manager, AuthEmp, faq, cri})
})

// FAQ 게시글 수정한거 전송하기
router.post("/FAQModify", async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    let cri = {};
    const update = await models.faq.update({
        raw: true,
        title: req.body.title,
        content: req.body.content,
    }, {
        where: {
            no: req.body.no
        }
    });

    // 수정하고 수정된 페이지 보여줘야 하니까
    const faq = await models.faq.findOne({
        where: {
            no: req.body.no
        }
    });

    console.log('---------req.body------', req.body);
    console.log('-------수정하기----------', update);

    res.render("manager/board/FAQDetail", {Manager, AuthEmp, cri, update, faq});
})

// FAQ 게시글 삭제
router.delete('/removeFAQ', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    let cri = {};
    models.faq.destroy({
        where: {
            no: req.query.no,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render('manager/notice/FAQMngList', {Manager, AuthEmp, cri})
})

// 여행후기 관리 ------------------------------------------------------------------------
// 여행 후기 관리 게시판
router.get("/custBoardMngList", async (req, res, next) => {
    // header 공통 !!!
    const {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req ,res);

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    console.log("cust----------11111--");

    const list =
        await models.custboard.findAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    console.log("cust----------22222--");


    const listCount =
        await models.custboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = {currentPage};

    res.render("manager/board/custBoardList", {Manager, Auth, AuthEmp, login, list, pagingData, cri});
})

// 여행 후기 관리 게시글 읽기
router.get("/custBoardDetail", async (req, res, next) => {
    // header 공통 !!!
    const {AuthEmp, Manager} = sessionEmpCheck(req , res);



    let custBoardVO =
        await models.custboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    let cri = {};

    res.render("manager/board/custBoardDetail", {Manager, AuthEmp, custBoardVO, cri});
})

// 여행 후기 관리 게시글 삭제
router.delete("/removeCustBoard", async (req, res, next) => {

    let cri = {};
    let custboardVO = await models.custboard.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.custboard.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render("manager/board/custBoardList", {cri, custboardVO});
})


// --------------------------------------------------------------- 상품 문의사항 관리 ---------------------------------------------------------------
// 상품 문의 사항 게시판 목록 보기
router.get('/planBoardList', async (req, res, next) => {
// header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await models.planboard.findAll({
        raw: true,
        order: [
            ["id", "DESC"]
        ],
    })
    const listCount =
        await models.planboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = {};

    res.render("manager/board/planBoardList", {Manager, AuthEmp, list, pagingData, cri});

})

// 미답변 상품 문의 사항 게시글 읽기
router.get('/planBoardModify', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    let plan =
        await models.planboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('---답변전------', plan);
    let cri = {};

    res.render("manager/board/planBoardModify", {Manager, AuthEmp, plan, cri});
})

// 답변 달고 전송하기
router.post('/planBoardModify/reply/:id', async (req, res, next) => {
    // header 공통 !!!
    console.log("444444444444->", req.params.id);

    let {id } = req.params.id;
    let {respondWriter, respondcontent} = req.body;

    const update = await models.planboard.update({
        raw : true,
        answer : 1,
        respond : respondcontent
    }, {
        where : {
            id : req.params.id
        }
    });

    console.log("4444444444443333333->", update);
    console.log('답변달기성공답변달기성공답변달기성공답변달기성공');
    if( update != null){
        res.status(204).json({"responsetxt":"updatesuccess"});
    }else{
        res.status(406).json({"responsetxt":"updatefailed"});
    }

})


// 답변 완료 상품 문의 사항 게시글 읽기
router.get("/planBoardDetail", async (req, res, next) => {
// header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const passedUpdate = req.session.update;
    req.session.update = [];
    console.log('-------req.query----------', req.query);

    let plan =
        await models.planboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('---답변완료된 게시물------', plan);
    let cri = {};

    res.render("manager/board/planBoardDetail", {passedUpdate, Manager, AuthEmp, plan, cri});
})

// // 답변 완료 상품 문의 사항 게시글의 '답변' 수정하기
// router.post("/planBoardModify/:id", async ( req, res, next) => {
//
//     let {data} = req.body;
//     let {test, kkkk} = req.query;
//     console.log('----수정된 respond---------',req.params, req.body);
//     let update = await models.planboard.update({
//         raw : true,
//         respond : req.body.respondText
//     }, {
//         where : {
//             id : req.params.id
//         }
//     });
//
//     if(update != null){
//         res.status(201).json({"response":"success"});
//     }
//     else{
//         res.status(500).json({"response":"fail"});
//     }
//
// })


// 상품 문의 사항 게시글 삭제
router.delete('/deletePlanBoard', async (req, res, next) => {

    let cri = {};
    let plan = await models.planboard.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    models.planboard.destroy({
        where: {
            id: req.query.id,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render("manager/board/planBoardList", {cri, plan});
})

// --------------------------------------------------------------- 📢️️ 공지사항 관리 ------------------------------------------
router.get('/noticeMngList', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    let noticeFixedList =
        await models.notice.findAll({
            raw: true,
            where: {
                fixed: 1
            },
            limit, offset
        });
    console.log('====', noticeFixedList);


    let noticeNoFixedList =
        await models.notice.findAll({
            raw: true,
            where: {
                fixed: 0
            },
            order: [
                ["regdate", "DESC"]
            ],
            limit, offset
        });

    let noticeNoFixedCountList =
        await models.notice.findAndCountAll({
            raw: true,
            where: {
                fixed: 0
            },
            order: [
                ["regdate", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(noticeNoFixedCountList, currentPage, limit);
    console.log('---------', noticeNoFixedList);

    res.render("manager/notice/noticeMngList", {Manager, AuthEmp, cri, noticeFixedList, noticeNoFixedList, pagingData});
})

//공지사항 추가하는 화면
router.get('/addNoticeForm', (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    let totalCnt = {};

    res.render('manager/notice/addNoticeForm', {Manager, AuthEmp, totalCnt});
})

//공지사항 추가하기
router.post('/addNoticeForm', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);

    let {title, content} = req.body;
    console.log('-----------req.body---------', req.body);
    let body = {};
    let isChecked = req.body.fixed;
    if (isChecked != true) {
        body = {
            raw: true,
            fixed: 0,
            title: title,
            writer: req.body.writer, //투어랜드 hidden 되어있음
            content: content
        }
    } else {
        body = {
            raw: true,
            fixed: 1,
            title: title,
            writer: req.body.writer, //투어랜드 hidden 되어있음
            content: content,
        }
    }
    const noticeRegister = await models.notice.create(body);
    console.log('전송성공전송성공전송성공전송성공전송성공전송성공');
    console.log('----------------등록내용-----------------', noticeRegister);
    if( noticeRegister != null){
        return res.status(204).json({"responseText":"addSuccess"});
    }else{
        return res.status(406).json({"responseText":"addFail"});
    }

// // ------------------공지 등록하면 공지사항도 같이 보여줘야함-----------------------------------
//     const usersecess = req.params.usersecess;
//     let {searchType, keyword} = req.query;
//
//     const contentSize = 5 // 한페이지에 나올 개수
//     const currentPage = Number(req.query.currentPage) || 1; //현재페이
//     const {limit, offset} = getPagination(currentPage, contentSize);
//
//     keyword = keyword ? keyword : "";
//
//     let cri = {currentPage};
//
//     let body = {};
//     let isChecked = req.body.fixed;
//     if (isChecked != true) {
//         body = {
//             raw: true,
//             fixed: 0,
//             title: req.body.title,
//             writer: req.body.writer, //투어랜드 hidden 되어있음
//             content: req.body.content,
//         }
//     } else {
//         body = {
//             raw: true,
//             fixed: 1,
//             title: req.body.title,
//             writer: req.body.writer, //투어랜드 hidden 되어있음
//             content: req.body.content,
//         }
//     }
//     const noticeRegister = await models.notice.create(body);
//
//     let noticeFixedList =
//         await models.notice.findAll({
//             raw: true,
//             where: {
//                 fixed: 1
//             },
//             limit, offset
//         });
//     console.log('====', noticeFixedList);
//     let noticeNoFixedList =
//         await models.notice.findAll({
//             raw: true,
//             where: {
//                 fixed: 0
//             },
//             order: [
//                 ["regdate", "DESC"]
//             ],
//             limit, offset
//         });
//     let noticeNoFixedCountList =
//         await models.notice.findAndCountAll({
//             raw: true,
//             where: {
//                 fixed: 0
//             },
//             order: [
//                 ["regdate", "DESC"]
//             ],
//             limit, offset
//         });
//
//     const pagingData = getPagingData(noticeNoFixedCountList, currentPage, limit);
//     console.log('---------', noticeNoFixedList);

})

// 공지사항 읽기
router.get('/noticeDetail', async (req, res, next) => {

    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    let cri = {};
    const notice = await models.notice.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });

    res.render("manager/notice/noticeDetail", {Manager, AuthEmp, notice, cri});
})

// 공지사항 수정하기
router.get('/editNotice', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    let cri = {};
    const notice = await models.notice.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });
    console.log('-------수정화면입장----------', notice);

    res.render("manager/notice/editNotice", {Manager, AuthEmp, cri, notice});
})

// 공지사항 수정하기 전송
router.post('/editNotice', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const update = await models.notice.update({
        raw: true,
        title: req.body.title,
        content: req.body.content,
        fixed: req.body.fixed
    }, {
        where: {
            no: req.body.no
        }
    });

    console.log('---------req.body------', req.body);
    console.log('-------수정하기----------', update);
    console.log('전송성공전송성공전송성공전송성공전송성공전송성공');
    if( update != null){
        return res.status(204).json({"responseText":"addSuccess"});
    }else{
        return res.status(406).json({"responseText":"addFail"});
    }

});

// 공지사항 삭제하기
router.delete('/removeNotice', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    let cri = {};
    models.notice.destroy({
        where: {
            no: req.query.no,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render('manager/notice/noticeMngList', {Manager, Auth, cri})
})

// --------------------------------------------------------------- 쿠폰 관리 ---------------------------------------------------------------
router.get('/couponMngList', async (req, res, next) => {
    // header 공통 !!!
    const { AuthEmp, Auth, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE) // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    const available = await models.coupon.findAll({
        raw: true,
        order: [
            ["cno", "DESC"]
        ],
    })

    const expired = await models.coupon.findAll({
        raw: true,
        where: {
            edate: {[Op.lt]: new Date()}
        },
        order: [
            ["cno", "DESC"]
        ],
    })

    const listCount =
        await models.coupon.findAndCountAll({
            raw: true,
            order: [
                ["cno", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);

    res.render("manager/coupon/couponMngList", {AuthEmp,Manager, Auth, cri, available, expired, pagingData});
})

// --------------------------------------------------------------- 결제 관리 ---------------------------------------------------------------
router.get('/paymentList', async (req, res, next) => {
    // header 공통 !!!
    const { Auth, AuthEmp, Manager} = sessionEmpCheck(req ,res);
    if(Manager == undefined) res.redirect("/customer");

    let cri = {};


    res.render("manager/payment/paymentList", {Manager, Auth, cri});
})


// --------------------------------------------------------------- 로그인폼------------------------------------------------
router.get('/loginForm', async (req, res, next) => {
    let {registerSuccess, id} = req.query;

    let UserStay = {userid: id};

    let EmpStay = {};
    let error = "";
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";


    res.render("user/tourlandLoginForm", {
        Auth,
        login,
        Manager,
        searchkeyword,
        registerSuccess,
        UserStay,
        EmpStay,
        error
    });
});


router.post('/loginForm', async (req, res, next) => {
    let {id, pass} = req.body;
    console.log("loginForm->", id, pass)
    if (id == null) res.status(400).send('idempty');
    if (pass == null) res.status(400).send('passempty');


    if (id !== null && pass != null) {
        // ID,PASS가 입력된 경우
        let userVO = models.user.findOne({
            raw: true,
            attributes: ['userpass', 'usersecess'],
            where: {
                userid: id
            }
        })

        // 직원 ID가 없는 경우
        if (userVO == null) res.status(402).send("idnoneexist");
        // 직원 ID가 있는 경우
        if (userVO != null && userVO.usersecess != 1) {
            res.status(402).send("retiredemployee");
        }
        if (userVO != null && userVO.usersecess == 0) {
            if (comparePassword(userVO.userid, pass)) {
                res.redirect('/tourlandMain?');
            } else {
                res.status(405).send("passwdnotequal");
            }
        }

    }

    let empVO = {};
    let session = {};

    let registerSuccess = {};
    let UserStay = {};
    let EmpStay = {};
    let error = "";
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";

    res.render("user/tourlandLoginForm", {
        Auth,
        login,
        Manager,
        searchkeyword,
        registerSuccess,
        UserStay,
        EmpStay,
        error
    });
});

//
// router.post('/loginForm', async (req, res, next) => {
//     let {registerSuccess, id} = req.query;
//     let EmpStay = {};
//     let error = "";
//     let Auth = {};
//     let login = "";
//     let Manager = {};
//     let searchkeyword = "";
//
//
//     res.render("user/tourlandLoginForm", {
//         Auth,
//         login,
//         Manager,
//         searchkeyword,
//         registerSuccess,
//         UserStay,
//         EmpStay,
//         error
//     });
// });


router.get('/employee/idCheck/:userid', async (req, res, next) => {

    const userid = req.params.userid;

    try {
        let checkUserid = await models.employee.findOne({
            raw: true,
            attributes: ['empid'],
            where: {
                userid: userid
            }
        })

        if (checkUserid != null) {
            console.log("check->", checkUserid.empid);
            if (checkUserid.empid != null) {
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


router.get('/tourlandRegister', async (req, res, next) => {
    let autoNo = "";

    res.render("user/tourlandRegisterForm", {autoNo});

});


module.exports = router;
