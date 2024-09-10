const knex = require("knex");

exports.up = function(knex) {
    return knex.schema.createTable("categories", table => {
        table.increments("id");
        table.text("name").notNullable();
    }).then(function() {
        return knex('categories').insert([
            { name: 'Bebidas' },
            { name: 'Refeições' },
            { name: 'Sobremesa' }
        ]);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable("categories");
};
