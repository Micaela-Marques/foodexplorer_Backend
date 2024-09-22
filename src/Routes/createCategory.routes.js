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

// Rota para buscar categorias
productRoutes.get("/", productController.searchCategory); // Corrigido para usar `searchCategory`

module.exports = productRoutes;
