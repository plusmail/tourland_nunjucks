const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Op = sequelize.Op;
const literal = sequelize.literal;

const {employee,
    user, 
    coupon,
    usercoupon, 
    reservation,
    userpstatus,
    product,
    airplane,
    hotel,
    tour,
    event,
    faq,
    custboard,
    planboard,
    notice,
    rentcar,pairstatus,photelstatus

} = require("../../models");


const cookieParser = require("cookie-parser");
const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto'); //추가됐음
const {getPagingData, getPagination,getPagingDataCount} = require('../../controller/pagination');
const {makePassword, comparePassword} = require('../../controller/passwordCheckUtil');
const moment = require("moment");
const bodyParser = require('body-parser');
const parser = bodyParser.urlencoded({extended: false});
const {upload} = require("../../controller/fileupload");
const {sessionEmpCheck} = require('../../controller/sessionCtl');

const { isNotLoggedIn, isLoggedIn } = require('../../middlewares')
router.use((req, res, next)=>{
    res.locals.user = req.user;
    next();
});

router.get('/', async function (req, res, next) {
    res.redirect('/manager/statistics');
});


// ------------------------------------- 관리자 페이지 메인 -------------------------------------
router.get('/statistics', (req, res, next) => {
    // if(req.user === undefined) res.redirect("/customer");
    const Manager = {
        right:0
    };

    console.log('-----관리자페이지메인------',);
    res.render("manager/main/statistics",{Manager});
});

router.get('/userlist', (req, res, next) => {

    let cri = {};
    let btnName = "";
    let list = {};

    res.render("userMngList", {cri, btnName, list});
});


//----------------------------- 고객관리 ---------------------------------------
// 고객 관리 전체 목록
router.get('/userMngList', async (req, res, next) => {

    let {usersecess, searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let listAndCounts = await user.findAndCountAll({
        where: {
            [Op.and]: [
                {
                    // usersecess: usersecess
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

    console.log("usersecbtt->", btnName)

    res.render("manager/user/userMngList", {cri, lists, btnName, pagingData, usersecess});
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

    res.render("manager/user/userDetailForm", {userVO, cri});
});




router.get('/employeeRegister', (req, res, next)=>{

    return res.render('manager/employee/employeeRegister');
})


router.post("/employeeRegister", async (req, res, next) => {
    const {empno,empbirth,emptel,empauth,empretired,userid}= req.body;
    console.log('내용내용내용내용내용내용1', req.body);
    req.body.empretired = 1;

    const register = await employee.create(req.body)
    console.log('내용내용내용내용내용내용', register);

    res.redirect("/manager/employeeMngList");
})


// ------------------------------------------------ 직원관리 --------------------------------------------------------
// 직원 관리 전체 목록
router.get('/employeeMngList', async (req, res, next) => {
    //empretired 정상사원, 퇴사사원 구분
    // const empretired = req.params.empretired;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let listAndCounts = await employee.findAndCountAll({
        raw: true,
        nest : true,
        attributes : ['empno', 'empbirth', 'emptel', 'empauth','empretired'],
        include: [
            {
                model: user,
                attributes: ['userid', 'username', 'usersecess'],
                as: 'user',
                nest: true,
                paranoid: true,
                required: false,
            }],
        where: {
            // [Op.and]: [
            //     {
            //         empretired: empretired
            //     }
            // ],
            [Op.or]: [
                {
                    empno: {[Op.like]: "%" + keyword + "%"}
                }
            ]
        },
        limit, offset
    })

    const {count:totalItems, rows: lists} = listAndCounts;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    // let btnName = (Boolean(Number(empretired)) ? "직원 리스트" : "퇴사사원 조회");

    console.log("employeeMngList---->", lists)

    res.render("manager/employee/employeeMngList", {cri, lists,pagingData});
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

    const listAndCounts =
        await reservation.findAndCountAll({
            // raw: true,
            include: [
                {
                    model: user,
                    attributes: ['userid', 'username'],
                    as: 'userno_user',
                    nest: true,
                    raw: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: userpstatus,
                    attributes: ['no', 'userno', 'pno'],
                    as: 'userpstatuses',
                    nest: true,
                    raw: true,
                    paranoid: true,
                    required: false,
                    include :[{
                        model: product,
                        attributes: ['id', 'pname', 'pexpire','pprice'],
                        as: 'pno_product',
                        nest: true,
                        raw: true,
                        paranoid: true,
                        required: false,
                    }
                    ]
                }],
        
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });


    const {count:totalItems, rows: lists} = listAndCounts;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    console.log("reservationMngList --->",lists[0].userpstatuses[0].pno_product );


    let cri = {currentPage};


    res.render("manager/reservation/reservationMngList", {lists , pagingData, cri});

});


// / ✈️ 항공관리 productfilightMngList----------------------------------------------------
// 항공 관리 전체 목록
router.get('/flightMngList', async (req, res, next) => {

    let {searchType, keyword} = req.query;

    const contentSize = Number(10); // 한페이지에 나올 개수
    const currentPage = Number(req.query.page) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    let querystring = null;
    let flightList = [];
    let dataCountAll = [];

    if (searchType == "id") {
        flightList = await airplane.findAll({
            where: {[Op.or]: [{id: {[Op.like]: keyword}},]}, limit, offset
        })

        dataCountAll = await airplane.findAndCountAll({
            where: {[Op.or]: [{id: {[Op.like]: keyword}}]}, limit, offset
        })
    } else if (searchType == "ano") {
        flightList = await airplane.findAll({
            where: {[Op.or]: [{ano: {[Op.like]: "%" + keyword + "%"}},]}, limit, offset
        })

        dataCountAll = await airplane.findAndCountAll({
            where: {[Op.or]: [{ano: {[Op.like]: "%" + keyword + "%"}}]}, limit, offset
        })

    } else if (searchType == "rloca") {
        flightList = await airplane.findAll({
            where: {[Op.or]: [{rlocation: {[Op.like]: "%" + keyword + "%"}},]}, limit, offset
        })

        dataCountAll = await airplane.findAndCountAll({
            where: {[Op.or]: [{rlocation: {[Op.like]: "%" + keyword + "%"}}]}, limit, offset
        })
    } else {
        flightList = await airplane.findAll({
            where: {}, limit, offset
        })
        dataCountAll = await airplane.findAndCountAll({
            where: {}, limit, offset
        })
    }

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/flight/flightMngList2", {cri, lists, pagingData});
})

// 항공 관리 페이지에서 검색 기능(국내)
router.get('/flightDomList/:id', async (req, res, next) => {
    let {searchType, keyword} = req.query;
    let { id} = req.params;

    let {currentPage} = req.params;

    const contentSize = Number(10); // 한페이지에 나올 개수
    currentPage = Number(currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let flightList = await airplane.findAll({
        where: { id },
        limit, offset
    })

    let dataCountAll = await airplane.findAndCountAll({
        where: {},
        limit, offset
    })

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/flight/flightMngList2", {cri, lists, pagingData});
});
// 항공 관리 페이지에서 검색 기능(해외)
router.get('/flightAbroadList/:currentPage', async (req, res, next) => {

    let {searchType, keyword} = req.query;

    let {currentPage} = req.params;

    const contentSize = Number(10); // 한페이지에 나올 개수
    currentPage = Number(currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let flightList = await airplane.findAll({
        where: {},
        limit, offset
    })

    let dataCountAll = await airplane.findAndCountAll({
        where: {},
        limit, offset
    })

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/flight/flightMngList2", {cri, lists, pagingData});
});
//항공편 추가 페이지
router.get('/addFlightForm', async (req, res, next) => {

    let location = "/manager/hotelMngList";

    res.render("manager/flight/addFlightForm2", {location});
});

router.post('/addFlightForm', async (req, res, next) => {

    let list = await airplane.findAndCountAll({
        where: {},
    });
    const {count:totalItems, rows: lists} = dataCountAll;

    res.render("manager/flight/addFlightForm2", {totalItems, lists});
});

router.get('/flightDetail', async (req, res, next) => {

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

    res.render("manager/flight/flightDetail", {cri, noDiv, prevAir, selectedAir})
});


// 🏨 호텔 관리 -------------------
// 호텔 관리 전체 목록
router.get('/hotelMngList', async (req, res, next) => {

    let {searchType, keyword, keyword2, keyword3} = req.query;

    const contentSize = Number(10); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let dataCountAll = await hotel.findAndCountAll({
        attributes: ['id', 'hname', 'haddr', 'checkin', 'checkout', 'capacity', 'price', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup', 'totalcapacity', 'pdiv'],
        where: {},
        limit, offset
    });


    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword, keyword2, keyword3};

    let location = "/manager/hotelMngList";

    res.render("manager/hotel/hotelMngList", {cri, lists, pagingData, location});
});


//호텔 등록
router.get('/hotelRegister', async (req, res, next) => {

    let lastNum = "";

    res.render("manager/hotel/hotelRegister", {lastNum});
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
    let {searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";

    const hotelVo = await hotel.findOne({
        // raw : true,
        nest: true,
        attributes: ['id', 'hname', 'haddr', 'checkin', 'checkout', 'capacity', 'price', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup', 'totalcapacity', 'pdiv'],
        where: {
            id: req.query.id
        },
    });

    let cri = {searchType, keyword};

    res.render("manager/hotel/hotelModify", {cri, hotelVo});
});

router.post("/hotelModify", async (req, res, next) => {
    // header 공통 !!!
    const update = await hotel.update({
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

    let hotelVO = await hotel.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    hotel.destroy({
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

    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list = await tour.findAll({
        // raw : true,
        nest: true,
        attributes: ['id', 'tname', 'tlocation', 'startdate', 'enddate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
        where: {},
        limit, offset
    });
    let dataCountAll = await tour.findAndCountAll({
        where: {},
        limit, offset
    });

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);


    let cri = {searchType, keyword};

    res.render("manager/tour/tourMngList", {cri, lists, pagingData});
});

router.get('/tourRegister', async (req, res, next) => {

    res.render("manager/tour/tourRegister");
});

router.post("/tourRegister", async (req, res, next) => {

    const register = await tour.create({
        raw: true,
        id: req.body.id,
        ldiv: req.body.ldiv,
        tlocation: req.body.tlocation,
        tname: req.body.tname,
        startdate: req.body.startDate,
        enddate: req.body.endDate,
        taddr: req.body.taddr,
        etime: req.body.etime,
        capacity: req.body.capacity,
        tprice: req.body.tprice
    });

    res.redirect("/manager/tourMngList");
});

router.get('/tourDetail', async (req, res, next) => {

    let {searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, keyword};

    const tourVO =
        await tour.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });


    res.render("manager/tour/tourDetail", {cri,tourVO})

});

router.get('/tourModify', async (req, res, next) => {

    let {searchType,searchType2, keyword} = req.query;


    keyword = keyword ? keyword : "";
    let cri = {searchType, searchType2, keyword};

    const tourVO =
        await tour.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });


    res.render("manager/tour/tourModify", {tourVO,cri});

});

router.post("/tourModify", async (req, res, next) => {

    const {id, 
        ldiv, 
        tlocation, 
        tname, 
        startdate, 
        enddate, 
        taddr, 
        etime, capacity, tprice} = req.body

        console.log("tourModify ---->",req.body);

    const update = await tour.update({
            id,ldiv,tlocation,tname,startdate,enddate,taddr,etime,capacity,tprice
        },
        {
            where: {id}
        }
    );

    if (update != null) {
        res.status(203).json({"responseText": "modifysuccess"});

    } else {
        res.status(303).json({"responseText": "modifyfaild"});
    }
});


router.get('/tourDelete', async (req, res, next) => {

    let tourVO = await tour.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    tour.destroy({
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

    let {searchType, keyword} = req.query;

    const contentSize = Number(10); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let dataCountAll = await rentcar.findAndCountAll({
        attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
        where: {},
        limit, offset
    });


    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);


    let cri = {searchType, keyword};

    res.render("manager/rentcar/rentcarMngList", {cri, lists, pagingData});
});

router.get('/rentcarRegister', async (req, res, next) => {

    res.render("manager/rentcar/rentcarRegister");
});

router.post("/rentcarRegister", async (req, res, next) => {

    const register = await rentcar.create(req.body);

    res.redirect("/manager/rentcarMngList");
});

router.get('/rentcarDetailForm', async (req, res, next) => {

    const rentcarVO =
        await rentcar.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });

    res.render("manager/rentcar/rentcarDetailForm", {rentcarVO})
});

router.post("/rentcarDetailFormUpdate", async (req, res, next) => {

    const update = await rentcar.update(req.body,
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

    let rentcarVO = await rentcar.findOne({
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

    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이지
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let dataCountAll = await product.findAndCountAll({
        // raw : true,
        nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        include: [
            {
                model: airplane,
                attributes: ['price', 'ano'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: hotel,
                attributes: ['checkin', 'checkout', 'price', 'hname'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: tour,
                attributes: ['tname', 'tprice'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: rentcar,
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
            },
        ],
        where: {},
        limit, offset
    });


    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/product/productMngList", {cri, lists, pagingData});
});

router.get('/productDetail', async (req, res, next) => {

    let {id, searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";

    const vo = await product.findOne({
        // raw : true,
        nest: true,
        attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        where : { id : id},
        include: [
            {
                model: airplane,
                attributes: ['price', 'ano', 'id', 'dlocation', 'rlocation', 'ddate', 'rdate', 'seat', 'ldiv', 'capacity'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: hotel,
                attributes: ['checkin', 'checkout', 'price', 'hname', 'id', 'haddr', 'capacity', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup'],
                as: 'hotelId_hotels',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: tour,
                attributes: ['tprice', 'id', 'tname', 'tlocation', 'startDate', 'endDate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            },
            {
                model: rentcar,
                attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
            },
        ]
    });

    let cri = {searchType, keyword};

    res.render("manager/product/productDetail", {vo, cri})
});

router.get('/productModify/:id', async (req, res, next) => {
    const {id} = req.params;

    let {searchType, searchType2, keyword, keyword2, keyword3} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, searchType2, keyword, keyword2, keyword3};

    const vo = await product.findOne({
        // raw : true,
        where : {id},
        nest: true,
        attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        include: [
            {
                model: airplane,
                attributes: ['price', 'ano', 'id', 'dlocation', 'rlocation', 'ddate', 'rdate', 'seat', 'ldiv', 'capacity'],
                as: 'airplaneId_airplanes',
                nest: true,
                paranoid: true,
                required: false,
            },{
            model: hotel,
            attributes: ['checkin', 'checkout', 'price', 'hname', 'id', 'haddr', 'capacity', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup'],
            as: 'hotelId_hotels',
            nest: true,
            paranoid: true,
            required: false,
            },{
                model: tour,
                attributes: ['tprice', 'id', 'tname', 'tlocation', 'startDate', 'endDate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
                as: 'tourId_tours',
                nest: true,
                paranoid: true,
                required: false,
            },{
                model: rentcar,
                attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
                as: 'rentcarId_rentcars',
                nest: true,
                paranoid: true,
                required: false,
                },
            ]

        });



    // const voAirPlane = await product.findOne({
    //     // raw : true,
    //     where : {id},
    //     nest: true,
    //     attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
    //     include: [
    //         {
    //             model: airplane,
    //             attributes: ['price', 'ano', 'id', 'dlocation', 'rlocation', 'ddate', 'rdate', 'seat', 'ldiv', 'capacity'],
    //             as: 'airplaneId_airplanes',
    //             nest: true,
    //             paranoid: true,
    //             required: false,
    //         },
    //     ]
    //     });

    // const voHotel = await product.findOne({
    //     // raw : true,
    //     nest: true,
    //     attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
        
    //     include :[ {
    //             model: hotel,
    //             attributes: ['checkin', 'checkout', 'price', 'hname', 'id', 'haddr', 'capacity', 'roomcapacity', 'roomtype', 'ldiv', 'bookedup'],
    //             as: 'hotelId_hotels',
    //             nest: true,
    //             paranoid: true,
    //             required: false,
    //         },
    //     ]
    // });

    // const voTour = await product.findOne({
    //     // raw : true,
    //     nest: true,
    //     attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],

    //     include : [{
    //             model: tour,
    //             attributes: ['tprice', 'id', 'tname', 'tlocation', 'startDate', 'endDate', 'taddr', 'etime', 'capacity', 'tprice', 'ldiv'],
    //             as: 'tourId_tours',
    //             nest: true,
    //             paranoid: true,
    //             required: false,
    //         },
    //     ]
    // });

    // const voRentCar = await product.findOne({
    //     // raw : true,
    //     nest: true,
    //     attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],


    //     include : [ {
    //             model: rentcar,
    //             attributes: ['id', 'cdiv', 'cno', 'rentddate', 'returndate', 'rentaddr', 'returnaddr', 'price', 'capacity', 'insurance', 'ldiv'],
    //             as: 'rentcarId_rentcars',
    //             nest: true,
    //             paranoid: true,
    //             required: false,
    //         },
    //     ]
    // });

    // const vo = {voAirPlane, voHotel, voTour, voRentCar};

    const flightListDepature = await airplane.findAll({
        where: {},
    });
    const flightListRending = await airplane.findAll({
        where: {},
    });
    const hotelList = await hotel.findAll({
        where: {},
    });
    const tourList = await tour.findAll({
        where: {},
    });
    const rentcarList = await rentcar.findAll({
        where: {},
    });

    // console.log("productModify-------->",vo.airplaneId_airplanes);

    res.render("manager/product/productModify", {
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

    let vo = await product.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    product.destroy({
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

    let {searchType, keyword} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {searchType, keyword};
    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const airplane_currentPage = Number(req.query.airplane_currentPage) || 1; //현재페이지
    let {limit_airplne, offset_airplne} = getPagination_airplne(airplane_currentPage, contentSize);

    let airplane_count = await airplane.findAndCountAll({
        nest : true,
        where: {},
        limit, offset
    });
    const pagingData_airplane = getPagingData(airplane_count, airplane_currentPage, limit);

    console.log("----->",airplane_currentPage, contentSize, limit, offset );

    const hotel_currentPage = Number(req.query.hotel_currentPage) || 1; //현재페이지
    let {limit_hotel, offset_hotel} = getPagination(hotel_currentPage, contentSize);
    let hotel_count = await hotel.findAndCountAll({
        where: {},
        limit_hotel, offset_hotel
    });
    const pagingData_hotel = getPagingData(hotel_count, hotel_currentPage, limit_hotel);


    const tour_currentPage = Number(req.query.tour_currentPage) || 1; //현재페이지
    const {limit_tour, offset_tour} = getPagination(tour_currentPage, contentSize);
    let tour_count = await tour.findAndCountAll({
        where: {},
        limit_tour, offset_tour
    });
    const pagingData_tour = getPagingData(tour_count, tour_currentPage, limit_tour);


    const rentcar_currentPage = Number(req.query.rentcar_currentPage) || 1; //현재페이지
    const {limit_rentcar, offset_rentcar} = getPagination(rentcar_currentPage, contentSize);
    let rentcar_count = await rentcar.findAndCountAll({
        where: {},
        limit_rentcar, offset_rentcar
    });
    const pagingData_rentcar = getPagingData(rentcar_count, rentcar_currentPage, limit_rentcar);


    const flightListDepature = await airplane.findAll({
        where: {},
        limit_airplane, offset_airplane
    });

    const flightListRending = await airplane.findAll({
        where: {},
    });
    const hotelList = await hotel.findAll({
        where: {},
        limit_hotel, offset_hotel
    });
    const tourList = await tour.findAll({
        where: {},
        limit_tour, offset_tour
    });
    const rentcarList = await rentcar.findAll({
        where: {},
        limit_rentcar, offset_rentcar
    });


    res.render("manager/product/addProductForm", {
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

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const dataCountAll =
        await event.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);
    

    res.render("manager/event/eventMngList", {lists, pagingData})
})

// 이벤트 상세보기
router.get('/eventDetailForm', async (req, res, next) => {

    const eventVO =
        await event.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });

    res.render("manager/event/eventDetailForm", {eventVO})
})

// 이벤트 등록하기 화면 보이기
router.get("/eventRegister", async (req, res, next) => {
    let url2 = {};

    res.render("manager/event/eventRegister", {url2});
})

// 이벤트 등록할 게시글 작성하고 전송하기
router.post("/eventRegister", upload.single("eventPic"), async (req, res, next) => {

    const register = await event.create({
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

    const update = await event.update(body,
        {
            where: {
                id: req.body.id
            }
        });
    console.log('---------req.body------', req.body);
    console.log('-------수정하기----------', update);

    res.redirect("/manager/eventMngList");
})


// 이벤트 삭제하기
router.delete('/deleteEvent', async (req, res, next) => {

    let eventVO = await event.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    await event.destroy({
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

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const dataCountAll =
        await faq.findAndCountAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });


    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);
    let cri = {currentPage, searchType, keyword};


    res.render("manager/board/FAQMngList", {lists , pagingData, cri});

})

// FAQ 등록하기 입장
router.get("/FAQRegister", async (req, res, next) => {

    res.render("manager/board/FAQRegister")
})

// FAQ 등록하기 전송
router.post("/FAQRegister", async (req, res, next) => {

    const faq = await faq.create({
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

    const dataCountAll =
        await models.faq.findAndCountAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });

        const {count:totalItems, rows: lists} = dataCountAll;
        const pagingData = getPagingDataCount(totalItems, currentPage, limit);
        let cri = {searchType, keyword};

    res.render("manager/board/FAQMngList", {faq, lists, pagingData, cri})
})

// FAQ 게시글 읽기
router.get("/FAQDetail", async (req, res, next) => {
    let list = await faq.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });
    console.log('-----------------FAQ읽기----------------', list);

    res.render("manager/board/FAQDetail", {list});
})

// FAQ 게시글 수정
router.get("/FAQModify", async (req, res, next) => {
    let list = await faq.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });
    console.log('-------수정화면입장----------', list);

    res.render("manager/board/FAQModify", {list})
})

// FAQ 게시글 수정한거 전송하기
router.post("/FAQModify", async (req, res, next) => {
    const update = await faq.update({
        raw: true,
        title: req.body.title,
        content: req.body.content,
    }, {
        where: {
            no: req.body.no
        }
    });

    // 수정하고 수정된 페이지 보여줘야 하니까
    const list = await faq.findOne({
        where: {
            no: req.body.no
        }
    });

    console.log('---------req.body------', req.body);
    console.log('-------수정하기----------', update);

    res.render("manager/board/FAQDetail", {update, list});
})

// FAQ 게시글 삭제
router.delete('/removeFAQ', async (req, res, next) => {
    await faq.destroy({
        where: {
            no: req.query.no,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render('manager/notice/FAQMngList', {})
})

// 여행후기 관리 ------------------------------------------------------------------------
// 여행 후기 관리 게시판
router.get("/custBoardMngList", async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const dataCountAll =
        await custboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    let cri = {searchType, keyword};

    res.render("manager/board/custBoardList", {lists, pagingData, cri});
})

// 여행 후기 관리 게시글 읽기
router.get("/custBoardDetail", async (req, res, next) => {

    let custBoardVO =
        await custboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    let cri = {};

    res.render("manager/board/custBoardDetail", {custBoardVO, cri});
})

// 여행 후기 관리 게시글 삭제
router.delete("/removeCustBoard", async (req, res, next) => {

    let cri = {};
    let custboardVO = await custboard.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    
    await custboard.destroy({
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

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const dataCountAll =
        await planboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);
    
    let cri = {};

    res.render("manager/board/planBoardList", {lists, pagingData, cri});

})

// 미답변 상품 문의 사항 게시글 읽기
router.get('/planBoardModify', async (req, res, next) => {

    let plan =
        await planboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('---답변전------', plan);
    let cri = {};

    res.render("manager/board/planBoardModify", {plan, cri});
})

// 답변 달고 전송하기
router.post('/planBoardModify/reply/:id', async (req, res, next) => {

    let {id } = req.params.id;
    let {respondWriter, respondcontent} = req.body;

    const update = await planboard.update({
        raw : true,
        answer : 1,
        respond : respondcontent
    }, {
        where : {
            id : req.params.id
        }
    });

    console.log("4444444444443333333->", update);
    if( update != null){
        res.status(204).json({"responsetxt":"updatesuccess"});
    }else{
        res.status(406).json({"responsetxt":"updatefailed"});
    }

})


// 답변 완료 상품 문의 사항 게시글 읽기
router.get("/planBoardDetail", async (req, res, next) => {

    let plan =
        await planboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('---답변완료된 게시물------', plan);
    let cri = {};

    res.render("manager/board/planBoardDetail", {plan, cri});
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
    let plan = await planboard.findOne({
        raw: true,
        where: {
            id: req.query.id
        }
    });
    await planboard.destroy({
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

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    let cri = {currentPage};
 
    let dataCountAll =
        await notice.findAndCountAll({
            raw: true,
            where: {
            },
            order: [
                ["fixed", "DESC"],
                ["regdate", "DESC"]
            ],
            limit, offset
        });

    const {count:totalItems, rows: lists} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);

    res.render("manager/notice/noticeMngList", {cri, lists});
})

//공지사항 추가하는 화면
router.get('/addNoticeForm', (req, res, next) => {

    let totalCnt = {};

    res.render('manager/notice/addNoticeForm', {totalCnt});
})

//공지사항 추가하기
router.post('/addNoticeForm', async (req, res, next) => {

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
    const noticeRegister = await notice.create(body);
    if( noticeRegister !== null){
        console.log('----------------등록성공 전송-----------------');
        return res.status(200).json({"responseText":"addSuccess"});
    }else{
        console.log('----------------등록실패 전송-----------------');
        return res.status(400).json({"responseText":"addFail"});
    }

})

// 공지사항 읽기
router.get('/noticeDetail', async (req, res, next) => {

    let cri = {};
    const list = await notice.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });

    res.render("manager/notice/noticeDetail", {list, cri});
})

// 공지사항 수정하기
router.get('/editNotice', async (req, res, next) => {

    let cri = {};
    const list = await notice.findOne({
        raw: true,
        where: {
            no: req.query.no
        }
    });
    console.log('-------수정화면입장----------', list);

    res.render("manager/notice/editNotice", { cri, list});
})

// 공지사항 수정하기 전송
router.post('/editNotice', async (req, res, next) => {

    const update = await notice.update({
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
    if( update != null){
        return res.status(204).json({"responseText":"addSuccess"});
    }else{
        return res.status(406).json({"responseText":"addFail"});
    }

});

// 공지사항 삭제하기
router.delete('/removeNotice', async (req, res, next) => {

    let cri = {};
    await notice.destroy({
        where: {
            no: req.query.no,
        }
    }).then((result) => {
        console.log('----------삭제되었습니다------->', result);
    }).catch((err) => {
        console.log('삭제 실패!!', err);
        next(err);
    })

    res.render('manager/notice/noticeMngList', {cri})
})

// --------------------------------------------------------------- 쿠폰 관리 ---------------------------------------------------------------
router.get('/couponMngList', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE) // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("today-kr", formattedDate);
    const dataCountAll =
        await coupon.findAndCountAll({
            attributes : [
                "cno","cname", "ccontent", "pdate", "mrate","edate",
                [literal('CASE WHEN edate >'+`DATE("${formattedDate}")`+ 'THEN "available" ELSE "expired" END'),'use']
            ],
            where : {
                // [Op.or]:[
                // {edate: {
                //     [Op.lt]: literal(`DATE("${formattedDate}")`)
                //   }
                // },
                // {
                // edate: {
                //     [Op.gt]: literal(`DATE("${formattedDate}")`)
                // }}
                // ]
            },
            raw: true,
            order: [
                ["cno", "DESC"]
            ],

            limit, offset
        });

    const {count:totalItems, rows: list} = dataCountAll;
    const pagingData = getPagingDataCount(totalItems, currentPage, limit);
        

    res.render("manager/coupon/couponMngList", {cri, list, pagingData});
})



// --------------------------------------------------------------- 쿠폰 상세 ---------------------------------------------------------------
router.get('/couponDetail', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword, currentPage, cno} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("today-kr", formattedDate);
    const list =
        await coupon.findOne({
            attributes : [
                "cno","cname", "ccontent", "pdate", "mrate","edate",
                [literal('CASE WHEN edate >'+`DATE("${formattedDate}")`+ 'THEN "available" ELSE "expired" END'),'use']
            ],
            where : { cno },
            raw: true,
            order: [
                ["cno", "DESC"]
            ],

        });

    res.render("manager/coupon/couponDetail", {cri, list});
})


// --------------------------------------------------------------- 쿠폰 수정 폼---------------------------------------------------------------
router.get('/editCoupon', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword, currentPage, cno} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log("today-kr", formattedDate);
    const list =
        await coupon.findOne({
            attributes : [
                "cno","cname", "ccontent", "pdate", "mrate","edate",
                [literal('CASE WHEN edate >'+`DATE("${formattedDate}")`+ 'THEN "available" ELSE "expired" END'),'use']
            ],
            where : { cno },
            raw: true,
            order: [
                ["cno", "DESC"]
            ],

        });

    res.render("manager/coupon/editCoupon", {cri, list});
})


// --------------------------------------------------------------- 쿠폰 수정 폼---------------------------------------------------------------
router.post('/editCoupon', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword, currentPage, cno} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    console.log("editCoupoin---->", req.body);

    const update =
        await coupon.update(req.body,{
            where : { cno:req.body.cno },
        });

    if( update !== null){
        return res.status(200).json({"responseText":"updateSuccess"});
    }else{
        return res.status(400).json({"responseText":"updateFail"});
    }
})

// --------------------------------------------------------------- 쿠폰 수정 폼---------------------------------------------------------------
router.post('/removeCoupon', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword, currentPage, cno} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {currentPage};

    console.log("removeCoupon---->", req.body);

    const remove =
        await coupon.destroy({
            where : { cno:req.body.cno },
        });

    if( remove !== null){
        return res.status(200).json({"responseText":"removeSuccess"});
    }else{
        return res.status(400).json({"responseText":"removeFail"});
    }
})



router.get("/addCouponForm", async( req, res, next)=>{


    res.render("manager/coupon/addCouponForm");
})


router.post('/addCouponForm', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword, currentPage, cno} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {currentPage};
    

    console.log("addCouponForm---->", req.body);
    delete req.body["cno"];
    let { cname, pdate, edate , ccontent , mrate } = req.body;

    const create =
        await coupon.create({
            cname,
            pdate,
            edate,
            ccontent,
            mrate
        });

    if( create !== null){
        return res.status(200).json({"responseText":"createSuccess"});
    }else{
        return res.status(400).json({"responseText":"createFail"});
    }
})


router.get('/addCouponToUserForm', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword, currentPage, cno} = req.query;

    keyword = keyword ? keyword : "";
    let cri = {currentPage};
    

    console.log("addCouponForm---->", req.body);
    delete req.body["cno"];
    let { cname, pdate, edate , ccontent , mrate } = req.body;

    const create =
        await coupon.create({
            cname,
            pdate,
            edate,
            ccontent,
            mrate
        });

    res.render("manager/coupon/addCouponToUserForm");
})




// --------------------------------------------------------------- 결제 관리 ---------------------------------------------------------------
router.get('/paymentList', async (req, res, next) => {

    let cri = {};

    res.render("manager/payment/paymentList", {cri});
})


// --------------------------------------------------------------- 로그인폼------------------------------------------------
router.get('/loginForm', async (req, res, next) => {
    let {registerSuccess, id} = req.query;

    let UserStay = {userid: id};

    let EmpStay = {};
    let error = "";
    let searchkeyword = "";


    res.render("user/tourlandLoginForm", {
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
        let userVO = user.findOne({
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

    let registerSuccess = {};
    let UserStay = {};
    let EmpStay = {};
    let error = "";
    let searchkeyword = "";

    res.render("user/tourlandLoginForm", {
        searchkeyword,
        registerSuccess,
        UserStay,
        EmpStay,
        error
    });
});



router.get('/tourlandRegister', async (req, res, next) => {

    res.render("user/tourlandRegisterForm");

});


module.exports = router;
