
const AppError = require("../utils/AppError")


class UsersController {
create(request, response) {
    const { name, email, passwords } = request.body;

    if(!name) {
      throw new AppError("O nome é obrigatório")
    }
      
      response.send({name, email, passwords});
}
}

module.exports = UsersController;