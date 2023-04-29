const {user} = require('../models');


exports.viewedProducts = async (req,pno, next) =>{

    if (req.isAuthenticated()) {
        // 로그인된 사용자의 경우 viewedProducts 배열에 추가합니다.
        let viewedProduct = req.user.viewedProducts || [];
        console.log("viewedP->>>> isAuth", req.user.viewedProducts);


        if (!viewedProduct.includes(pno)) {
            viewedProduct.push(pno);
        }
        console.log("viewedP->>>> login", viewedProduct);


        const updateResult = await user.update({
            viewedProducts : viewedProduct,
        },{
            where : {userid : req.user.userid}
        });

    } else {
    // 로그인되지 않은 사용자의 경우 쿠키를 사용하여 viewedProducts 배열에 추가합니다.
        const viewedProduct = req.cookies.viewedProducts || [];
        if (!viewedProduct.includes(pno)) {
            viewedProduct.push(pno);
            if(req.cookie ?? false)
            req.cookie('viewedProducts', viewedProduct, { maxAge: 604800000 });
        }

        console.log("viewedP->>>> cookie", viewedProduct);

    }

    return this.viewedProducts;

}

exports.viewedProductsList = (req,res, next) =>{
    let viewedProduct;
    if (req.isAuthenticated()) {
        // 로그인된 사용자의 경우 viewedProducts 배열에 추가합니다.
        viewedProduct = req.user.viewedProducts;

    } else {
    // 로그인되지 않은 사용자의 경우 쿠키를 사용하여 viewedProducts 배열에 추가합니다.
        viewedProduct = req.cookies.viewedProducts;

        if(!viewedProduct){
            viewedProduct = [];
            res.cookie("viewedProducts", viewedProduct);
        }
    }
    // console.log("viewedProductsList->", viewedProduct)

    return viewedProduct;

}

