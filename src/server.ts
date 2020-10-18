import express from 'express';
import path from 'path'
import 'express-async-errors'
import cors from 'cors'
import routesAuth from './routes/auth'
import routesProtected from './routes/protected'

import './database/connection';
import errorHandler from './errors/handler'

const app = express()

app.use(cors())
app.use(express.json());
app.use(routesAuth);
app.use(routesProtected);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use(errorHandler)

app.listen(3333);