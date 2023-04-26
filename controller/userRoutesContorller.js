const {user} = require('../models');


exports.viewedProducts = async (req,pno, next) =>{
    if (req.isAuthenticated()) {
        // 로그인된 사용자의 경우 viewedProducts 배열에 추가합니다.
        let viewedProduct = req.user.viewedProducts;
        if (!viewedProduct.includes(pno)) {
            viewedProduct.push(pno);
        }

        const updateResult = await user.update({
            viewedProducts : viewedProduct,
        },{
            where : {userid : req.user.userid}
        });

    } else {
        // 로그인되지 않은 사용자의 경우 쿠키를 사용하여 viewedProducts 배열에 추가합니다.
        const viewedProducts = req.cookies.viewedProducts || [];
        if (!viewedProducts.includes(pno)) {
            viewedProducts.push(pno);
            res.cookie('viewedProducts', viewedProducts, { maxAge: 604800000 });
        }
    }

    return this.viewedProducts;

}

exports.viewedProductsList = (req,next) =>{
    let viewedProduct;
    if (req.isAuthenticated()) {
        // 로그인된 사용자의 경우 viewedProducts 배열에 추가합니다.
        viewedProduct = req.user.viewedProducts;

    } else {
        // 로그인되지 않은 사용자의 경우 쿠키를 사용하여 viewedProducts 배열에 추가합니다.
        viewedProduct = req.cookies.viewedProducts;
    }
    // console.log("viewedProductsList->", viewedProduct)

    return viewedProduct;

}
