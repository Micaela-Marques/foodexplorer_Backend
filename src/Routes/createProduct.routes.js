const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const ProductController = require("../controllers/productController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const productRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const productController = new ProductController();

// Aplica autenticação em todas as rotas
productRoutes.use(ensureAuthenticated);

// Rotas para gerenciar produtos
productRoutes.post("/", upload.single("image"), productController.create); // Cria um novo produto
productRoutes.get("/", productController.listProducts); // Busca os produtos

productRoutes.get("/:id", productController.show); // Exibe detalhes do produto pelo ID
productRoutes.delete("/:id", productController.delete); // Remove um produto pelo ID
productRoutes.put("/:id", upload.single("image"), productController.update); // Atualiza o produto pelo ID


module.exports = productRoutes;
