const { Router } = require("express");

const ProductController = require("../controllers/productController");

const productRoutes = Router();

const productController = new ProductController();


productRoutes.post("/:user_id", productController.create);
productRoutes.get("/:id", productController.get);
productRoutes.delete("/:id", productController.delete);
productRoutes.get("/", productController.index);

module.exports = productRoutes;
