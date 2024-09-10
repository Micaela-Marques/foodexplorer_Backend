const knex = require("../database/knex");

class productController {
  async create(request, response) {
    try {
      const {
        name,
        description,
        ingredients,
        price,
        avatar_url,
        categories_id,
      } = request.body;
      const { user_id } = request.params;

      const [product_id] = await knex("product").insert({
        name,
        description,
        price,
        categories_id,
        avatar_url,
        user_id,
      });

      await knex("ingredients").insert(
        ingredients.map((ingredient) => ({ name:ingredient, product_id }))
      );

      return response
        .status(201)
        .json({ message: "Produto cadastrado com sucesso!" });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async get(request, response) {
    const { id } = request.params;

    const product = await knex("product").where({ id }).first();

    const category = await knex("categories").where({
      id: product.categories_id,
    });

    return response.json({
      ...product,
      ingredients: JSON.parse(product.ingredients),
      category,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    try {
      const product = await knex("product").where({ id }).first();

      if (!product) {
        return response.status(404).json({ message: "Produto não encontrado" });
      }

      await knex("product").where({ id }).delete();

      return response.status(204).send();
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Erro ao excluir produto", error: error.message });
    }
  }

  async index(request, response) {
    const { title, user_id, ingredients } = request.query;
    let ingredient

    try {
      if (!user_id) {
        return response
          .status(400)
          .json({ message: "O campo 'user_id' é obrigatório." });
      }

      if (ingredients) {
        const filterIngredients = ingredients.split(',').map(ingredient=> ingredient.trim());
        ingredient = await knex("ingredients")
         .whereIn("name", filterIngredients)
        
      }


      let query = knex("product").where({ user_id });

   
      if (title) {
        query = query.whereLike("name", `%${title}%`);
      }

    
      const products = await query.orderBy("name");

 
      return response.json(products);
    } catch (error) {
      return response
        .status(500)
        .json({ message: "Erro ao buscar produtos", error: error.message });
    }
  }
}

module.exports = productController;
