const knex = require("knex");
const products = require("../../assets/products.json")

exports.up = async knex => {
    await knex.schema.createTable("product", table => {
        table.increments("id");
        table.text("name").notNullable();
        table.text("description");
        table.decimal("price", 10, 2);
        table.text("image");
        table.integer("categories_id")
            .references("id")
            .inTable("categories")
            .onDelete("CASCADE");
        table.integer("user_id")
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");
        table.timestamp("created_at").default(knex.fn.now());
        table.timestamp("updated_at").default(knex.fn.now());
    });

    await knex("product").insert(products);
};

exports.down = async knex => {
    await knex.schema.dropTable("product");
};
