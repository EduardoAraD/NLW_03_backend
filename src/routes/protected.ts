import { Router } from 'express'
import multer from 'multer'

import OrphanagesController from '../controllers/OrphanagesController'
import uploadConfig from '../config/upload'

const auth = require('../middleware/auth')

const routes = Router();
const upload = multer(uploadConfig);
// index, show, create, update, delete

//routes.use(auth)
routes.get('/orphanages', OrphanagesController.index);
routes.get('/orphanages/:id', OrphanagesController.show);
routes.post('/orphanages', upload.array('images'), OrphanagesController.create);

export default routes;