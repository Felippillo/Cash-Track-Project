import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jws";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body

        //Prevenir usuarios duplicados
        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            const error = new Error('El correo electrónico ya está en uso')
            return res.status(409).json({ error: error.message })
        }

        try {
            const user = new User(req.body)
            user.password = await hashPassword(password)
            user.token = generateToken()
            await user.save()

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })


            res.json({ message: 'Cuenta creada exitosamente' })
        } catch (error) {
            //console.log(error)
            res.status(500).json({ message: 'Error interno del servidor' })
        }

    }

    static confirmAccount = async (req: Request, res: Response) => {
        const { token } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Token inválido')
            return res.status(401).json({ error: error.message })
        }

        user.confirmed = true
        user.token = null
        await user.save()
        res.json("Cuenta confirmada exitosamente")

    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        //Verificar que el usuario exista
        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({ error: error.message })
        }

        //Verificar que el usuario esté confirmado
        if (!user.confirmed) {
            const error = new Error('La cuenta no ha sido confirmada')
            return res.status(403).json({ error: error.message })
        }
        //Verificar la contraseña
        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('La contraseña es incorrecta')
            return res.status(401).json({ error: error.message })
        }

        const token = generateJWT(user.id)

        res.json({ token })
    }


    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body

        //Verificar que el usuario exista
        const user = await User.findOne({ where: { email } })
        if (!user) {
            const error = new Error('El usuario no existe')
            return res.status(404).json({ error: error.message })
        }

        user.token = generateToken()
        await user.save()
        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json('Hemos enviado un correo con las instrucciones para restablecer tu contraseña')

    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const tokenExists = await User.findOne({ where: { token } })
        if (!tokenExists) {
            const error = new Error('Token inválido')
            return res.status(404).json({ error: error.message })
        }

        res.json('Token válido')

    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body


        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Token inválido')
            return res.status(404).json({ error: error.message })
        }

        //Asignar nueva contraseña
        user.password = await hashPassword(password)
        user.token = null
        await user.save()

        res.json('Contraseña restablecida exitosamente')

    }

}