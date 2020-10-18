import { Router } from 'express'

import UserController from '../controllers/UserController'

const routes = Router();
// index, show, create, update, delete

routes.post('/login', UserController.signIn)
routes.post('/signup', UserController.signUp)

export default routes;