const { Sequelize, DataTypes } = require("sequelize-yugabytedb");
const initModels = require("./models/init-models");

const sequelize = new Sequelize("supplier_db", "yugabyte", "yugabyte", {
  host: "127.0.1.1",
  port: "5433",
  dialect: "postgres",
});

const models = initModels(sequelize);

module.exports = { ...models };
