const { Router } = require('express')

const usersRouter = require('./users.routes')
const productRouter = require('./createProduct.routes')
const sessionsRouter = require('./sessions.routes')

const routes = Router()

routes.use('/users', usersRouter);
routes.use('/product', productRouter);
routes.use('/sessions', sessionsRouter);

module.exports = routes;