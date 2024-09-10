const knex = require("knex");

exports.up = function (knex) {
  return knex.schema.createTable("ingredients", (table) => {
    table.increments("id");
    table.text("name").notNullable();
    table
      .integer("product_id")
      .references("id")
      .inTable("product")
      .onDelete("CASCADE");
    table.integer("user_id").references("id").inTable("users");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("ingredients");
};
