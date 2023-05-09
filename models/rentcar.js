const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rentcar', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "번호"
    },
    cdiv: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      comment: "차종류"
    },
    cno: {
      type: DataTypes.CHAR(15),
      allowNull: true,
      comment: "차번호"
    },
    rentddate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "대여날짜"
    },
    returndate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "반납날짜"
    },
    rentaddr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "대여장소"
    },
    returnaddr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "반납장소"
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "가격"
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "인원"
    },
    insurance: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "보험여부"
    },
    ldiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "장소구분"
    },
    pdiv: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "상품구분"
    }
  }, {
    sequelize,
    tableName: 'rentcar',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
