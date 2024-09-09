const knex = require("knex");

exports.up = knex => knex.schema.createTable("category", table => {
    table.increments("id");
    table.text("name").notNullable();

    table.integer("product_id").references("id").inTable("createproduct").onDelete("CASCADE");
 
 
});


exports.down = knex => knex.schema.dropTable("category")