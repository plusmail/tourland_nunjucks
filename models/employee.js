const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('employee', {
    empno: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "사번"
    },
    empbirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "생년월일"
    },
    emptel: {
      type: DataTypes.CHAR(13),
      allowNull: true,
      comment: "전화번호"
    },
    empauth: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "직급"
    },
    empretired: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: "퇴사여부"
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'employee',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "empno" },
        ]
      },
      {
        name: "employee_FK",
        using: "BTREE",
        fields: [
          { name: "userid" },
        ]
      },
    ]
  });
};
