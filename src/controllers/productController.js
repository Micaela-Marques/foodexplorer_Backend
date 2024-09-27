const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");
const AppError = require("../utils/AppError");

class ProductController {
  async create(request, response) {
    try {
      const { name, description, categories_id, price, ingredients } = request.body;
      const user_id = request.user.id;

      // Validar dados de entrada
      if (!name || !description || !categories_id || !price || !ingredients || !Array.isArray(ingredients)) {
        throw new AppError("Dados inválidos para criar o produto.");
      }

      // Verificar se o produto já existe
      const existingProduct = await knex("product").where({ name }).first();
      if (existingProduct) {
        throw new AppError("Este prato já existe no cardápio.");
      }

      // Processar a imagem
      const diskStorage = new DiskStorage();
      const filename = request.file?.filename
        ? await diskStorage.saveFile(request.file.filename)
        : null;

      // Inserir o produto
      const [product_id] = await knex("product").insert({
        name,
        description,
        price,
        categories_id,
        image: filename,
        user_id,
      });

      // Inserir os ingredientes
      if (ingredients.length > 0) {
        const ingredientsToInsert = ingredients.map((ingredient) => ({
          name: ingredient,
          product_id,
          user_id,
        }));
        await knex("ingredients").insert(ingredientsToInsert);
      }

      // Retornar resposta de sucesso
      return response.status(201).json({
        message: "Produto cadastrado com sucesso!",
        product_id,
      });
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      if (error instanceof AppError) {
        return response.status(400).json({ error: error.message });
      }
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }
async delete(request, response) {
  const { id } = request.params;

  try {
    const product = await knex("product").where({ id }).first();
    if (!product) {
      return response.status(404).json({ message: "Produto não encontrado" });
    }

    await knex("ingredients").where({ product_id: id }).delete();
    await knex("product").where({ id }).delete();

    if (product.image) {
      const diskStorage = new DiskStorage();
      await diskStorage.deleteFile(product.image);
    }

    return response.status(204).send();
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Erro ao excluir produto", error: error.message });
  }
}
  async show(request, response) {
    const { id } = request.params;

    try {
      const product = await knex("product").where({ id }).first();

      if (!product) {
        return response.status(404).json({ message: "Produto não encontrado" });
      }

      const category = await knex("categories")
        .where({ id: product.categories_id })
        .first();

      const ingredients = await knex("ingredients")
        .where({ product_id: id })
        .select("name");

      return response.json({
        ...product,
        category,
        ingredients: ingredients.map((ingredient) => ingredient.name),
      });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  async update(request, response) {
    try {
      const { name, description, ingredients, price, categories_id } =
        request.body;
      const { id } = request.params;

      const product = await knex("product").where({ id }).first();
      if (!product) {
        return response.status(404).json({ error: "Esse prato não existe" });
      }

      let filename;
      if (request.file?.filename) {
        const diskStorage = new DiskStorage();
        if (product.image) {
          await diskStorage.deleteFile(product.image);
        }
        filename = await diskStorage.saveFile(request.file.filename);
      }

      await knex("product")
        .where({ id })
        .update({
          image: filename || product.image,
          name: name || product.name,
          description: description || product.description,
          categories_id: categories_id || product.categories_id,
          price: price || product.price,
        });

      if (ingredients) {
        await knex("ingredients").where({ product_id: id }).delete();
        const ingredientsToInsert = Array.isArray(ingredients)
          ? ingredients.map((ingredient) => ({
              name: ingredient,
              product_id: id,
            }))
          : [{ name: ingredients, product_id: id }];
        await knex("ingredients").insert(ingredientsToInsert);
      }

      return response
        .status(200)
        .json({ message: "Prato atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  async delete(request, response) {
    const { id } = request.params;

    try {
      const product = await knex("product").where({ id }).first();

      if (!product) {
        return response.status(404).json({ message: "Produto não encontrado" });
      }

      await knex("ingredients").where({ product_id: id }).delete();
      await knex("product").where({ id }).delete();

      if (product.image) {
        const diskStorage = new DiskStorage();
        await diskStorage.deleteFile(product.image);
      }

      return response.status(204).send();
    } catch (error) {
      console.error(error);
      return response
        .status(500)
        .json({ message: "Erro ao excluir produto", error: error.message });
    }
  }
  async listProducts(request, response) {
    const { category, name } = request.query;
    const user_id = request.user;
    console.log(user_id);

    try {
      let query = knex("product")
        .select(
          "product.id",
          "product.name",
          "product.description",
          "product.price",
          "product.image",
          "categories.name as category_name",
          "categories.id as category_id"
        )
        .leftJoin("categories", "product.categories_id", "categories.id")
        .leftJoin("ingredients", "product.id", "ingredients.product_id");

      

      if (category) {
        query = query.where(function() {
          this.where("categories.id", category)
              .orWhere("categories.name", "LIKE", `%${category}%`);
        });
      }

      if (name) {
        query = query.where(function () {
          this.where("product.name", "LIKE", `%${name}%`)
              .orWhere("product.id", name)
              .orWhere("ingredients.name", "LIKE", `%${name}%`);
        });
      }

      const products = await query.groupBy("product.id");

      const productsWithIngredients = await Promise.all(
        products.map(async (product) => {
          const ingredients = await knex("ingredients")
            .where({ product_id: product.id })
            .select("name");

          return {
            ...product,
            ingredients: ingredients.map((i) => i.name),
          };
        })
      );

      return response.json(productsWithIngredients);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      return response
        .status(500)
        .json({ error: "Erro ao listar produtos", message: error.message });
    }
  }
  async listCategories(request, response) {
    try {
      const categories = await knex("categories").select("*");

      if (categories.length === 0) {
        return response.status(404).json({ message: "Nenhuma categoria encontrada." });
      }

      return response.json(categories);
    } catch (error) {
      console.error("Erro ao listar categorias:", error);
      return response.status(500).json({ error: "Erro ao listar categorias" });
    }
  }
  async updatedProduct(request, response) {
    const { id } = request.params;
    const { name, description, price, categories_id, image } = request.body;

    try {
      const product = await knex("product").where({ id }).first();
      if (!product) {
        return response.status(404).json({ error: "Esse prato não existe" });
      }

      const diskStorage = new DiskStorage();

      let filename = product.image;
      if (image) {
        if (product.image) {
          await diskStorage.deleteFile(product.image);
        }
        filename = await diskStorage.saveFile(image);
      }

      const updatedProductData = {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        categories_id: categories_id || product.categories_id,
        image: filename,
      };

      await knex("product").where({ id }).update(updatedProductData);

      return response.json({ message: "Produto atualizado com sucesso", product: updatedProductData });
    } catch (error) {
      console.error("Erro ao atualizar dados do produto:", error);
      return response.status(500).json({ error: "Erro ao atualizar dados do produto" });
    }
  }

  async updateImage(request, response) {
    console.log('Método updateImage chamado');
    const product_id = request.params.id; // ID do produto a ser atualizado
    const imageFilename = request.file?.filename; // Usa o operador ?. para garantir que o arquivo foi enviado

    // Correção: avatarFilename para imageFilename
    if (!product_id || !imageFilename) {
        throw new AppError("Dados insuficientes para atualizar a imagem do produto", 400);
    }

    // Buscar o produto no banco de dados
    const product = await knex("product")
        .where({ id: product_id })
        .first();

    if (!product) {
        throw new AppError("Produto não encontrado", 404);
    }

    // Deletar imagem antiga, se existir
    if (product.image) { // Supondo que o campo da imagem seja `image`
        await diskStorage.deleteFile(product.image);
    }

    // Salvar nova imagem
    const filename = await diskStorage.saveFile(imageFilename);
    product.image = filename; // Atualiza o campo da imagem no objeto product

    // Atualizar produto no banco de dados
    await knex("product")
        .where({ id: product_id })
        .update({ image: product.image });

    // Retornar resposta com os dados atualizados do produto
    return response.json(product);
}

async showCart(request, response) {
  const { id } = request.params;

  try {
    const product = await knex("product").where({ id }).first();
    if (!product) {
      return response.status(404).json({ message: "Produto não encontrado" });
    }

    const ingredients = await knex("ingredients")
      .where({ product_id: id })
      .select("name");

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      ingredients: ingredients.map(ingredient => ingredient.name)
    };

    return response.json(result);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Erro ao buscar informações do produto", error: error.message });
  }
}
async showCartEdit(request, response) {
  const { id } = request.params;

  try {
    const product = await knex("product").where({ id }).first();
    if (!product) {
      return response.status(404).json({ message: "Produto não encontrado" });
    }

    const ingredients = await knex("ingredients")
      .where({ product_id: id })
      .select("name");

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      ingredients: ingredients.map(ingredient => ingredient.name)
    };

    return response.json(result);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: "Erro ao buscar informações do produto", error: error.message });
  }
}
}
module.exports = ProductController;
