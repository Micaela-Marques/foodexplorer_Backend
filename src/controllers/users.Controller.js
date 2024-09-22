const { hash} =require("bcryptjs")
const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite")

class UsersController {
//user creation
async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection()
//verify if users exist

    const checkUsersExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (checkUsersExists) {
        throw new AppError("Este e-mail já está em uso", 400);
    }
//encrypting password
    const hashedPassword = await hash(password, 8)

//Insert into database

    await database.run("INSERT INTO users (name, email, password) VALUES ( ? , ? , ? )", [name, email, hashedPassword] )

    return response.status(201).json();
   
}
}

module.exports = UsersController;