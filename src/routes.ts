import { Router } from 'express'
import multer from 'multer'

import OrphanagesController from './controllers/OrphanagesController'
import UserController from './controllers/UserController'
import uploadConfig from './config/upload'

const routes = Router();
const upload = multer(uploadConfig);
// index, show, create, update, delete

routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);


routes.post('/login', UserController.signIn)
routes.post('/signup', UserController.signUp)

export default routes;