const { Router } = require("express");

const ProductController = require("../controllers/productController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const productRoutes = Router();

const productController = new ProductController();

productRoutes.use(ensureAuthenticated);


productRoutes.post("/:user_id", productController.create);
productRoutes.get("/:id", productController.show);
productRoutes.delete("/:id", productController.delete);
productRoutes.get("/", productController.index);

module.exports = productRoutes;
