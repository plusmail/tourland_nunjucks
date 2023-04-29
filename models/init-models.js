var DataTypes = require("sequelize").DataTypes;
var _airplane = require("./airplane");
var _banner = require("./banner");
var _board = require("./board");
var _calendar = require("./calendar");
var _cart = require("./cart");
var _coupon = require("./coupon");
var _custboard = require("./custboard");
var _department = require("./department");
var _employee = require("./employee");
var _event = require("./event");
var _faq = require("./faq");
var _hotel = require("./hotel");
var _notice = require("./notice");
var _pairstatus = require("./pairstatus");
var _photelstatus = require("./photelstatus");
var _planboard = require("./planboard");
var _popup = require("./popup");
var _prentstatus = require("./prentstatus");
var _product = require("./product");
var _ptourstatus = require("./ptourstatus");
var _rentcar = require("./rentcar");
var _reservation = require("./reservation");
var _review = require("./review");
var _tour = require("./tour");
var _user = require("./user");
var _usercoupon = require("./usercoupon");
var _userpstatus = require("./userpstatus");
var _usertest = require("./usertest");

function initModels(sequelize) {
  var airplane = _airplane(sequelize, DataTypes);
  var banner = _banner(sequelize, DataTypes);
  var board = _board(sequelize, DataTypes);
  var calendar = _calendar(sequelize, DataTypes);
  var cart = _cart(sequelize, DataTypes);
  var coupon = _coupon(sequelize, DataTypes);
  var custboard = _custboard(sequelize, DataTypes);
  var department = _department(sequelize, DataTypes);
  var employee = _employee(sequelize, DataTypes);
  var event = _event(sequelize, DataTypes);
  var faq = _faq(sequelize, DataTypes);
  var hotel = _hotel(sequelize, DataTypes);
  var notice = _notice(sequelize, DataTypes);
  var pairstatus = _pairstatus(sequelize, DataTypes);
  var photelstatus = _photelstatus(sequelize, DataTypes);
  var planboard = _planboard(sequelize, DataTypes);
  var popup = _popup(sequelize, DataTypes);
  var prentstatus = _prentstatus(sequelize, DataTypes);
  var product = _product(sequelize, DataTypes);
  var ptourstatus = _ptourstatus(sequelize, DataTypes);
  var rentcar = _rentcar(sequelize, DataTypes);
  var reservation = _reservation(sequelize, DataTypes);
  var review = _review(sequelize, DataTypes);
  var tour = _tour(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var usercoupon = _usercoupon(sequelize, DataTypes);
  var userpstatus = _userpstatus(sequelize, DataTypes);
  var usertest = _usertest(sequelize, DataTypes);

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
