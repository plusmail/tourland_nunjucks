const DataTypes = require("sequelize").DataTypes;
const _airplane = require("./airplane");
const _banner = require("./banner");
const _board = require("./board");
const _calendar = require("./calendar");
const _cart = require("./cart");
const _coupon = require("./coupon");
const _custboard = require("./custboard");
const _department = require("./department");
const _employee = require("./employee");
const _event = require("./event");
const _faq = require("./faq");
const _hotel = require("./hotel");
const _notice = require("./notice");
const _pairstatus = require("./pairstatus");
const _photelstatus = require("./photelstatus");
const _planboard = require("./planboard");
const _popup = require("./popup");
const _prentstatus = require("./prentstatus");
const _product = require("./product");
const _ptourstatus = require("./ptourstatus");
const _rentcar = require("./rentcar");
const _reservation = require("./reservation");
const _review = require("./review");
const _tour = require("./tour");
const _user = require("./user");
const _usercoupon = require("./usercoupon");
const _userpstatus = require("./userpstatus");
const _usertest = require("./usertest");

function initModels(sequelize) {
  const airplane = _airplane(sequelize, DataTypes);
  const banner = _banner(sequelize, DataTypes);
  const board = _board(sequelize, DataTypes);
  const calendar = _calendar(sequelize, DataTypes);
  const cart = _cart(sequelize, DataTypes);
  const coupon = _coupon(sequelize, DataTypes);
  const custboard = _custboard(sequelize, DataTypes);
  const department = _department(sequelize, DataTypes);
  const employee = _employee(sequelize, DataTypes);
  const event = _event(sequelize, DataTypes);
  const faq = _faq(sequelize, DataTypes);
  const hotel = _hotel(sequelize, DataTypes);
  const notice = _notice(sequelize, DataTypes);
  const pairstatus = _pairstatus(sequelize, DataTypes);
  const photelstatus = _photelstatus(sequelize, DataTypes);
  const planboard = _planboard(sequelize, DataTypes);
  const popup = _popup(sequelize, DataTypes);
  const prentstatus = _prentstatus(sequelize, DataTypes);
  const product = _product(sequelize, DataTypes);
  const ptourstatus = _ptourstatus(sequelize, DataTypes);
  const rentcar = _rentcar(sequelize, DataTypes);
  const reservation = _reservation(sequelize, DataTypes);
  const review = _review(sequelize, DataTypes);
  const tour = _tour(sequelize, DataTypes);
  const user = _user(sequelize, DataTypes);
  const usercoupon = _usercoupon(sequelize, DataTypes);
  const userpstatus = _userpstatus(sequelize, DataTypes);
  const usertest = _usertest(sequelize, DataTypes);

  airplane.belongsToMany(product, { as: 'productId_products', through: pairstatus, foreignKey: "airplaneId", otherKey: "productId" });
  coupon.belongsToMany(user, { as: 'userno_users', through: usercoupon, foreignKey: "cno", otherKey: "userno" });
  hotel.belongsToMany(product, { as: 'productId_product_photelstatuses', through: photelstatus, foreignKey: "hotelId", otherKey: "productId" });
  product.belongsToMany(airplane, { as: 'airplaneId_airplanes', through: pairstatus, foreignKey: "productId", otherKey: "airplaneId" });
  product.belongsToMany(hotel, { as: 'hotelId_hotels', through: photelstatus, foreignKey: "productId", otherKey: "hotelId" });
  product.belongsToMany(rentcar, { as: 'rentcarId_rentcars', through: prentstatus, foreignKey: "productId", otherKey: "rentcarId" });
  product.belongsToMany(tour, { as: 'tourId_tours', through: ptourstatus, foreignKey: "productId", otherKey: "tourId" });
  rentcar.belongsToMany(product, { as: 'productId_product_prentstatuses', through: prentstatus, foreignKey: "rentcarId", otherKey: "productId" });
  tour.belongsToMany(product, { as: 'productId_product_ptourstatuses', through: ptourstatus, foreignKey: "tourId", otherKey: "productId" });
  user.belongsToMany(coupon, { as: 'cno_coupons', through: usercoupon, foreignKey: "userno", otherKey: "cno" });
  pairstatus.belongsTo(airplane, { as: "airplane", foreignKey: "airplaneId"});
  airplane.hasMany(pairstatus, { as: "pairstatuses", foreignKey: "airplaneId"});
  usercoupon.belongsTo(coupon, { as: "cno_coupon", foreignKey: "cno"});
  coupon.hasMany(usercoupon, { as: "usercoupons", foreignKey: "cno"});
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
  employee.belongsTo(user, { as: "user", foreignKey: "userid"});
  user.hasMany(employee, { as: "employees", foreignKey: "userid"});
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
