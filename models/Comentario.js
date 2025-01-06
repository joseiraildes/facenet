const { DataTypes } = require("sequelize");
const db = require("../sequelize/connection");

const Comentario = db.define("comentarios", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  post_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "posts",
      key: "id"
    },
    allowNull: false
  }
})