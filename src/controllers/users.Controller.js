const { hash } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UsersController {
  // User creation
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    // Verify if user exists
    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso", 400);
    }

    // Encrypting password
    const hashedPassword = await hash(password, 8);

    try {
      // Insert into database
      await database.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword]
      );

      return response.status(201).json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw new AppError("Erro ao criar usuário", 500);
    }
  }
}

module.exports = UsersController;