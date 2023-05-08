const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('usercoupon', {
    userno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "유저번호",
      references: {
        model: 'user',
        key: 'id'
      }
    },
    cno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "쿠폰번호",
      references: {
        model: 'coupon',
        key: 'cno'
      }
    }
  }, {
    sequelize,
    tableName: 'usercoupon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "userno" },
          { name: "cno" },
        ]
      },
      {
        name: "FK_coupon_TO_usercoupon",
        using: "BTREE",
        fields: [
          { name: "cno" },
        ]
      },
    ]
  });
};
