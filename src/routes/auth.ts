import { Router } from 'express'

import UserController from '../controllers/UserController'

const routes = Router();
// index, show, create, update, delete

routes.post('/login', UserController.signIn)
routes.post('/signup', UserController.signUp)
routes.post('/forgot_password', UserController.forgotPassword)
routes.post('/reset_password', UserController.resetPassword)

export default routes;