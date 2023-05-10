const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('coupon', {
    cno: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "쿠폰번호"
    },
    cname: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "쿠폰이름"
    },
    pdate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "발행일자"
    },
    edate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "만료일자"
    },
    ccontent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "쿠폰내용"
    },
    mrate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "할인율"
    }
  }, {
    sequelize,
    tableName: 'coupon',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "cno" },
        ]
      },
    ]
  });
};
