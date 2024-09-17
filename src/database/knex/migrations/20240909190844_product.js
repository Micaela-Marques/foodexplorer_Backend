const knex = require("knex");

exports.up = knex => knex.schema.createTable("product", table => {
    table.increments("id");
    table.text("name").notNullable();
    table.text("description");
    table.decimal("price", 10, 2);
    table.text("image");
    table.text("categories_id").references("id").inTable("categories");
    table.integer("user_id").references("id").inTable("users");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
});


exports.down = knex => knex.schema.dropTable("product")