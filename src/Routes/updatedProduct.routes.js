const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");
const ProductController = require("../controllers/productController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const productRoutes = Router();
const upload = multer(uploadConfig.MULTER);
const productController = new ProductController();

// Middleware de autenticação aplicado a todas as rotas
productRoutes.use(ensureAuthenticated);

// Rota para atualizar produto (incluindo a imagem)
productRoutes.put('/:id', upload.single('image'), verifyUserAuthorization ("admin"), productController.updatedProduct);

// Rota para listar produtos (assumindo que existe um método listProducts no controller)
productRoutes.get('/', verifyUserAuthorization ("admin"), productController.listProducts);

// Rota para obter um produto específico por ID
productRoutes.get('/:id', productController.show);

// Rota para obter informações do carrinho
productRoutes.get('/cart/:id', productController.showCart);

// Rota para obter informações do carrinho para edição
productRoutes.get('/admin/new/:id', verifyUserAuthorization ("admin"), productController.showCartEdit);

module.exports = productRoutes;
