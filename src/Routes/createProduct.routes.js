const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");
const verifyUserAuthorization = require("../middlewares/verifyUserAuthorization");

const ProductController = require("../controllers/productController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const productRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const productController = new ProductController();

// Aplica autenticação em todas as rotas
productRoutes.use(ensureAuthenticated);



// Rotas para gerenciar produtos
productRoutes.post("/", upload.single("image"),verifyUserAuthorization("admin"), productController.create); 
// Busca os produtos
productRoutes.get("/", productController.listProducts); 

// Exibe detalhes do produto pelo ID
productRoutes.get("/:id", productController.show); 

// Remove um produto pelo ID
productRoutes.delete("/:id", verifyUserAuthorization ("admin"), productController.delete); 

// Atualiza um produto existente pelo ID, permitindo a atualização de todos os campos, incluindo o upload de uma nova imagem
productRoutes.put("/:id", upload.single("image"), verifyUserAuthorization("admin"), productController.update); 

    


module.exports = productRoutes;
