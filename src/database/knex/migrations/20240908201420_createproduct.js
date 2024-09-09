const knex = require("knex");

exports.up = knex => knex.schema.createTable("createproduct", table => {
    table.increments("id");
    table.text("name").notNullable();
    table.text("description");
    table.decimal("price");
    table.text("avatar_url");
    table.integer("user_id").references("id").inTable("users");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
});


exports.down = knex => knex.schema.dropTable("createproduct")