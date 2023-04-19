let DataTypes = require("sequelize").DataTypes;
let _airplane = require("./airplane");
let _banner = require("./banner");
let _board = require("./board");
let _calendar = require("./calendar");
let _cart = require("./cart");
let _coupon = require("./coupon");
let _custboard = require("./custboard");
let _department = require("./department");
let _employee = require("./employee");
let _event = require("./event");
let _faq = require("./faq");
let _hotel = require("./hotel");
let _notice = require("./notice");
let _pairstatus = require("./pairstatus");
let _photelstatus = require("./photelstatus");
let _planboard = require("./planboard");
let _popup = require("./popup");
let _prentstatus = require("./prentstatus");
let _product = require("./product");
let _ptourstatus = require("./ptourstatus");
let _rentcar = require("./rentcar");
let _reservation = require("./reservation");
let _review = require("./review");
let _tour = require("./tour");
let _user = require("./user");
let _usercoupon = require("./usercoupon");
let _userpstatus = require("./userpstatus");
let _usertest = require("./usertest");

function initModels(sequelize) {
  let airplane = _airplane(sequelize, DataTypes);
  let banner = _banner(sequelize, DataTypes);
  let board = _board(sequelize, DataTypes);
  let calendar = _calendar(sequelize, DataTypes);
  let cart = _cart(sequelize, DataTypes);
  let coupon = _coupon(sequelize, DataTypes);
  let custboard = _custboard(sequelize, DataTypes);
  let department = _department(sequelize, DataTypes);
  let employee = _employee(sequelize, DataTypes);
  let event = _event(sequelize, DataTypes);
  let faq = _faq(sequelize, DataTypes);
  let hotel = _hotel(sequelize, DataTypes);
  let notice = _notice(sequelize, DataTypes);
  let pairstatus = _pairstatus(sequelize, DataTypes);
  let photelstatus = _photelstatus(sequelize, DataTypes);
  let planboard = _planboard(sequelize, DataTypes);
  let popup = _popup(sequelize, DataTypes);
  let prentstatus = _prentstatus(sequelize, DataTypes);
  let product = _product(sequelize, DataTypes);
  let ptourstatus = _ptourstatus(sequelize, DataTypes);
  let rentcar = _rentcar(sequelize, DataTypes);
  let reservation = _reservation(sequelize, DataTypes);
  let review = _review(sequelize, DataTypes);
  let tour = _tour(sequelize, DataTypes);
  let user = _user(sequelize, DataTypes);
  let usercoupon = _usercoupon(sequelize, DataTypes);
  let userpstatus = _userpstatus(sequelize, DataTypes);
  let usertest = _usertest(sequelize, DataTypes);

  airplane.belongsToMany(product, { as: 'productId_products', through: pairstatus, foreignKey: "airplaneId", otherKey: "productId" });
  hotel.belongsToMany(product, { as: 'productId_product_photelstatuses', through: photelstatus, foreignKey: "hotelId", otherKey: "productId" });
  product.belongsToMany(airplane, { as: 'airplaneId_airplanes', through: pairstatus, foreignKey: "productId", otherKey: "airplaneId" });
  product.belongsToMany(hotel, { as: 'hotelId_hotels', through: photelstatus, foreignKey: "productId", otherKey: "hotelId" });
  product.belongsToMany(rentcar, { as: 'rentcarId_rentcars', through: prentstatus, foreignKey: "productId", otherKey: "rentcarId" });
  product.belongsToMany(tour, { as: 'tourId_tours', through: ptourstatus, foreignKey: "productId", otherKey: "tourId" });
  rentcar.belongsToMany(product, { as: 'productId_product_prentstatuses', through: prentstatus, foreignKey: "rentcarId", otherKey: "productId" });
  tour.belongsToMany(product, { as: 'productId_product_ptourstatuses', through: ptourstatus, foreignKey: "tourId", otherKey: "productId" });
  pairstatus.belongsTo(airplane, { as: "airplane", foreignKey: "airplaneId"});
  airplane.hasMany(pairstatus, { as: "pairstatuses", foreignKey: "airplaneId"});
  photelstatus.belongsTo(hotel, { as: "hotel", foreignKey: "hotelId"});
  hotel.hasMany(photelstatus, { as: "photelstatuses", foreignKey: "hotelId"});
  cart.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(cart, { as: "carts", foreignKey: "pno"});
  pairstatus.belongsTo(product, { as: "product", foreignKey: "productId"});
  product.hasMany(pairstatus, { as: "pairstatuses", foreignKey: "productId"});
  photelstatus.belongsTo(product, { as: "product", foreignKey: "productId"});
  product.hasMany(photelstatus, { as: "photelstatuses", foreignKey: "productId"});
  prentstatus.belongsTo(product, { as: "product", foreignKey: "productId"});
  product.hasMany(prentstatus, { as: "prentstatuses", foreignKey: "productId"});
  ptourstatus.belongsTo(product, { as: "product", foreignKey: "productId"});
  product.hasMany(ptourstatus, { as: "ptourstatuses", foreignKey: "productId"});
  review.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(review, { as: "reviews", foreignKey: "pno"});
  userpstatus.belongsTo(product, { as: "pno_product", foreignKey: "pno"});
  product.hasMany(userpstatus, { as: "userpstatuses", foreignKey: "pno"});
  prentstatus.belongsTo(rentcar, { as: "rentcar", foreignKey: "rentcarId"});
  rentcar.hasMany(prentstatus, { as: "prentstatuses", foreignKey: "rentcarId"});
  userpstatus.belongsTo(reservation, { as: "no_reservation", foreignKey: "no"});
  reservation.hasMany(userpstatus, { as: "userpstatuses", foreignKey: "no"});
  ptourstatus.belongsTo(tour, { as: "tour", foreignKey: "tourId"});
  tour.hasMany(ptourstatus, { as: "ptourstatuses", foreignKey: "tourId"});
  cart.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(cart, { as: "carts", foreignKey: "userno"});
  reservation.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(reservation, { as: "reservations", foreignKey: "userno"});
  review.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(review, { as: "reviews", foreignKey: "userno"});
  usercoupon.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(usercoupon, { as: "usercoupons", foreignKey: "userno"});
  userpstatus.belongsTo(user, { as: "userno_user", foreignKey: "userno"});
  user.hasMany(userpstatus, { as: "userpstatuses", foreignKey: "userno"});

  return {
    airplane,
    banner,
    board,
    calendar,
    cart,
    coupon,
    custboard,
    department,
    employee,
    event,
    faq,
    hotel,
    notice,
    pairstatus,
    photelstatus,
    planboard,
    popup,
    prentstatus,
    product,
    ptourstatus,
    rentcar,
    reservation,
    review,
    tour,
    user,
    usercoupon,
    userpstatus,
    usertest,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
