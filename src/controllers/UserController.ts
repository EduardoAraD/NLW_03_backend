import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as Yup from 'yup'


import User from '../models/Users'
import UserView from '../views/user_view'
const env = require('../../.env');

const emailRegex = /\S+@\S+\.\S+/

interface DataRequestSignUp{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default {
    async signUp(request: Request, response: Response) {
        const {
            name,
            email,
            password,
            confirmPassword,
        } = request.body

        const data = {
            name,
            email,
            password,
            confirmPassword
        } as DataRequestSignUp

        // Checando o recebimento de dados
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().required(),
            password: Yup.string().required(),
        });

        await schema.validate(data, {
            abortEarly: false,
        })

        // checando o email
        if (!data.email.match(emailRegex)) {
            return response.status(400).send({ message: "O e-mail informado não é válido" })
        }

        // conferindo e fazendo o passwordHash
        const salt = bcrypt.genSaltSync()
        const passwordHash = bcrypt.hashSync(data.password, salt)

        if (!bcrypt.compareSync(data.confirmPassword, passwordHash)) {
            return response.status(400).send({ message: "Senhas não conferem" })
        }

        // criando o user no repositorio
        const usersRepository = getRepository(User)

        const userExisting = await usersRepository.findOne({ email: data.email })
        if(userExisting) {
            return response.status(400).send({ message: "Usuário já cadastrado" })
        }

        const userData = {
            name: data.name,
            email: data.email,
            password: passwordHash
        }

        const user = usersRepository.create(userData)

        await usersRepository.save(user)

        const token = jwt.sign({ ...user}, env.authSecret, {
            expiresIn: "1 day"
        })

        response.json(UserView.render(user, token))
    },

    async signIn(request: Request, response: Response) {
        const {
            email,
            password
        } = request.body

        const usersRepository = getRepository(User)

        const user = await usersRepository.findOne({ email })

        if(user && bcrypt.compareSync(password, user.password)){
            const token = jwt.sign({ ...user}, env.authSecret, {
                expiresIn: "1 day"
            })
            response.json(UserView.render(user, token))
        } else {
            response.status(400).send({ message: "Usuário/Senha inválidos" })
        }
    },
}