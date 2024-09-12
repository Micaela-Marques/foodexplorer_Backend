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
        ingredients.map((ingredient) => ({ name: ingredient, product_id, user_id }))
      );

      return response
        .status(201)
        .json({ message: "Produto cadastrado com sucesso!" });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async show(request, response) {
    const { id } = request.params;
  
    const product = await knex("product")
      .where({ id })
      .first();

      if (!product) {
        return response.status(404).json({ message: "Produto não encontrado" });
      }
      const category = await knex("categories")
      .where({ id: product.categories_id }) 
      .first();

    const ingredients = await knex("ingredients")
      .where({ product_id: id }); 
      
  
    return response.json({
      ...product,
      category,
      ingredients: ingredients.map(ingredient => ingredient.name), 
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
    const { name, ingredients } = request.query;
    
    // Verifique se o usuário foi autenticado
    console.log('Usuário autenticado:', request.user);
    
    const user_id = request.user ? request.user.id : null;
  
    if (!user_id) {
      return response.status(400).json({ message: "Usuário não autenticado" });
    }
  
    try {
      let product;
      if (ingredients) {
        const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim());
        console.log('Ingredientes filtrados:', filterIngredients);
  
        product = await knex("ingredients")
          .select([
            "product.id",
            "product.name",
            "product.user_id",
          ])
          .where("product.user_id", user_id)
          .whereLike("product.name", `%${name}%`)
          .whereIn("ingredients.name", filterIngredients)
          .innerJoin("product", "product.id", "ingredients.product_id")
          .groupBy("product.id")
          .orderBy("product.name");
      } else {
        product = await knex("product")
          .where({ user_id })
          .whereLike("name", `%${name}%`)
          .orderBy("name");
      }
  
      const userIngredients = await knex("ingredients").where({ user_id });
      const productWitheIngredients = product.map(product => {
        const productIngredients = userIngredients.filter(ingredient => ingredient.product_id === product.id);
  
        return {
          ...product,
          ingredients: productIngredients,
        };
      });
  
      return response.json(productWitheIngredients);
    } catch (error) {
      console.error('Erro na busca dos produtos:', error);
      return response.status(500).json({ message: "Erro ao buscar produtos", error: error.message });
    }
  }
  
  
  }
  




module.exports = productController;
