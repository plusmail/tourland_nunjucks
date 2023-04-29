const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      comment: "유저번호"
    },
    username: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "유저명"
    },
    userbirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "생년월일"
    },
    usertel: {
      type: DataTypes.CHAR(13),
      allowNull: true,
      comment: "전화번호"
    },
    useraddr: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "주소"
    },
    userpassport: {
      type: DataTypes.CHAR(9),
      allowNull: true,
      comment: "여권번호"
    },
    userid: {
      type: DataTypes.STRING(12),
      allowNull: true,
      comment: "유저아이디"
    },
    userpass: {
      type: DataTypes.STRING(512),
      allowNull: true,
      comment: "유저비밀번호"
    },
    usersecess: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1,
      comment: "탈퇴여부"
    },
    useremail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('customer','basic','supervisor','admin'),
      allowNull: true,
      defaultValue: "basic",
      comment: "권한여부"
    },
    postcode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    detailAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    extraAddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    accessToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    viewedProducts: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user',
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
