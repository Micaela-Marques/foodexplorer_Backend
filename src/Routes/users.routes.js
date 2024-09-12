const { Router } = require("express");
const UsersController = require("../Controllers/users.Controller");


const usersRoutes = Router();

const usersController = new UsersController();


usersRoutes.post("/", usersController.create);

module.exports = usersRoutes;
