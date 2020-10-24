import { Router } from 'express'
import multer from 'multer'

import UserController from '../controllers/UserController'
import OrphanagesController from '../controllers/OrphanagesController'

import uploadConfig from '../config/upload'

//const auth = require('../middleware/auth')

const upload = multer(uploadConfig);

const routes = Router();
// index, show, create, update, delete

routes.post('/login', UserController.signIn)
routes.post('/signup', UserController.signUp)
routes.post('/forgot_password', UserController.forgotPassword)
routes.post('/reset_password', UserController.resetPassword)

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.delete('/orphanages/:id', OrphanagesController.delete);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);
routes.put('/orphanages/:id', upload.array('images'), OrphanagesController.update);

export default routes;