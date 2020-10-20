import { Request, Response } from 'express'
import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as Yup from 'yup'
import crypto from 'crypto'

import Users from '../models/Users'
import UserView from '../views/user_view'
import { transport as mailer } from '../modules/mailer'
//const mailer = require('../modules/mailer');
const env = require('../../.env');

const emailRegex = /\S+@\S+\.\S+/

interface DataRequestSignUp {
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
        const usersRepository = getRepository(Users)

        const userExisting = await usersRepository.findOne({ email: data.email })
        if (userExisting) {
            return response.status(400).send({ message: "Usuário já cadastrado" })
        }

        const now = new Date();

        const userData = {
            name: data.name,
            email: data.email,
            password: passwordHash,
            passwordResetToken: '',
            passwordResetExpires: now,
        }

        const user = usersRepository.create(userData)

        await usersRepository.save(user)

        const token = jwt.sign({ ...user }, env.authSecret, {
            expiresIn: "1 day"
        })

        response.json(UserView.render(user, token))
    },

    async signIn(request: Request, response: Response) {
        const {
            email,
            password
        } = request.body

        const usersRepository = getRepository(Users)

        const user = await usersRepository.findOne({ email })

        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ ...user }, env.authSecret, {
                expiresIn: "1 day"
            })
            response.json(UserView.render(user, token))
        } else {
            response.status(400).send({ message: "Usuário/Senha inválidos" })
        }
    },

    async forgotPassword(request: Request, response: Response) {
        const { email } = request.body;

        try {
            const usersRepository = getRepository(Users)

            const user = await usersRepository.findOne({ email })
            if (!user)
                return response.status(400).send({ error: 'User not found' })

            const token = crypto.randomBytes(20).toString('hex');
            const now = new Date();
            now.setHours(now.getHours() + 1)

            await usersRepository.update(user.id, {
                passwordResetToken: token,
                passwordResetExpires: now,
            })

            mailer.sendMail({
                to: email,
                from: 'araujocarlos893@gmail.com',
                html: `<p>Você esqueceu sua senha? Não tem problema, utilize esse token: ${ token }</p>`,
            }, (err) => {
                if (err) {
                    return response.status(400).send({ error: 'Cannot send forgot password email' })
                }
            })

            response.send();

        } catch (err) {
            response.status(400).send({ error: 'Erro on forget password, try again' })
        }
    },

    async resetPassword(request: Request, response: Response) {
        const { email, token, password } = request.body;

        try {
            const usersRepository = getRepository(Users)

            const user = await usersRepository.findOne({ email })

            if (!user)
                return response.status(400).send({ error: 'User not found' })

            if (token !== user.passwordResetToken)
                return response.status(400).send({ error: 'Token invalid' })

            const now = new Date();

            if (now > user.passwordResetExpires)
                return response.status(400).send({ error: 'Token expired, generate a new one' })

            const salt = bcrypt.genSaltSync()
            const passwordHash = bcrypt.hashSync(password, salt)
            user.password = passwordHash

            await usersRepository.update({ id: user.id}, user);

            response.send();

        } catch (err) {
            response.status(400).send({ error: 'Cannot reset password, try again' })
        }
    }
}