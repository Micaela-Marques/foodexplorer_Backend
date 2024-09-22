const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");
const AppError = require('../utils/AppError');

class productController  {
  async create(request, response) {
    try {
 // Verifica o conteúdo da requisição
      const { name, description, categories_id, price, ingredients} = request.body;
      const user_id = request.user.id;
  
      // Verificar se o prato já existe
      const 
      thisProductExists = await knex("product").where({ name }).first();
    
      if (thisProductExists) {
        throw new AppError("Este prato já existe no cardápio.");
      }
  
      let filename 
  
      if (request.file && request.file.filename) {
        // Instanciando DiskStorage
        const diskStorage = new DiskStorage();
  
        // Salvando arquivo de imagem
        filename = await diskStorage.saveFile(request.file.filename);
      }
  
      // Inserindo o produto
      const [product_id] = await knex("product").insert({
        name,
        description,
        price,
        categories_id,
        image: filename ,
        user_id
      });
  
      // Inserindo ingredientes
      await knex("ingredients").insert(
        ingredients.map((ingredient) => ({
          name: ingredient,
          product_id,
          user_id
        }))
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

    const product = await knex("product").where({ id }).first();

    if (!product) {
      return response.status(404).json({ message: "Produto não encontrado" });
    }
    const categories_id = await knex("categories")
      .where({ id: product.categories_id })
      .first();

    const ingredients = await knex("ingredients").where({ product_id: id });

    return response.json({
      ...product,
      categories_id,
      ingredients: ingredients.map((ingredient) => ingredient.name),
    });
  }
  async index(request, response) {
    const { name, ingredients } = request.query;

    // Verifique se o usuário foi autenticado
    console.log("Usuário autenticado:", request.user);

    const user_id = request.user ? request.user.id : null;

    if (!user_id) {
      return response.status(400).json({ message: "Usuário não autenticado" });
    }

    try {
      let product;
      if (ingredients) {
        const filterIngredients = ingredients
          .split(",")
          .map((ingredient) => ingredient.trim());
        console.log("Ingredientes filtrados:", filterIngredients);

        product = await knex("ingredients")
          .select(["product.id", "product.name", "product.user_id"])
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
      const productWitheIngredients = product.map((product) => {
        const productIngredients = userIngredients.filter(
          (ingredient) => ingredient.product_id === product.id
        );

        return {
          ...product,
          ingredients: productIngredients,
        };
      });

      return response.json(productWitheIngredients);
    } catch (error) {
      console.error("Erro na busca dos produtos:", error);
      return response
        .status(500)
        .json({ message: "Erro ao buscar produtos", error: error.message });
    }
  }

  async update(request, response) {
    try {
      const { name, description, ingredients, price, image, categories_id } = request.body;
      const { id } = request.params;
  
      // Verificar se o produto existe
      const product = await knex("product").where({ id }).first();
      if (!product) {
        return response.status(404).json({ error: 'Esse prato não existe' });
      }
  
      let filename;
      if (request.file && request.file.filename) {
        const imageFileName = request.file.filename;
        const diskStorage = new DiskStorage();
  
        // Excluir o arquivo antigo se existir
        if (product.image) {
          await diskStorage.deleteFile(product.image);
        }
  
        // Salvar o novo arquivo
        filename = await diskStorage.saveFile(imageFileName);
      }
  
      // Atualizar os dados do produto
      await knex("product").where({ id }).update({
        image: filename || product.image,  // Usar a nova imagem se fornecida, senão manter a existente
        name: name ?? product.name,
        description: description ?? product.description,
        categories_id: categories_id ?? product.categories_id,
        price: price ?? product.price
      });
  
      // Processar os ingredientes
      const hasAnIngredient = typeof ingredients === "string";
      let ingredientsInsert;
  
      if (hasAnIngredient) {
        ingredientsInsert = {
          name: ingredients,
          product_id: product.id,
        };
      } else if (Array.isArray(ingredients) && ingredients.length > 0) {
        ingredientsInsert = ingredients.map(ingredient => ({
          product_id: product.id,
          name: ingredient,
        }));
      } else {
        return response.status(400).json({ error: 'Dados de ingredientes inválidos' });
      }
  
      // Atualizar os ingredientes
      await knex("ingredients").where({ product_id: id }).delete();
      await knex("ingredients").where({ product_id: id }).insert(ingredientsInsert);
  
      return response.status(200).json('Prato atualizado com sucesso');
    } catch (error) {
      console.error(error);  // Log the error for debugging
      return response.status(500).json({ error: 'Internal Server Error' });
    }
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
  
  async searchCategory(request, response) {
    try {
      // Executa uma consulta para buscar todas as categorias
      const categories = await knex("categories")
      .select("*");
 
  
      // Verifica se há categorias retornadas
      if (categories.length === 0) {
        return response.status(404).json({ message: "Nenhuma categoria encontrada." });
      }
     
  
      // Retorna todas as categorias encontradas
      return response.json(categories);
      
    } catch (error) {
      
      console.error("Erro ao buscar categorias:", error);
      return response.status(500).json({ error: "Erro ao buscar categorias" });
 
    }
  }
  
}
  

module.exports = productController;
