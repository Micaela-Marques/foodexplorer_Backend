const { verify } = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");

function ensureAuthenticated(request, response, next) {
  const authHeader = request.headers.authorization;
  
  if (!authHeader) {
    throw new AppError("JWT Token não fornecido", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id, role } = verify(token, authConfig.jwt.secret);

    // Ajustar para request.user, não request.user_id
    request.user = {
      id: Number(user_id),  // Garante que o ID será um número
      role: role
    };

    return next();
  } catch {
    throw new AppError("JWT Token inválido", 401);
  }
}

module.exports = ensureAuthenticated;
