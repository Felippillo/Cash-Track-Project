import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'Confirma tu cuenta en CashTrackr',
            html: `
            <p>Hola ${user.name}, confirma tu cuenta en CashTrackr</p>
            <p>Tu cuenta ya está casi lista, solo debes confirmarla en el siguiente enlace:</p>
            <a href="#">Confrimar Cuenta</a>
            <p> e ingresa el codigo: <b>${user.token}</b></p> 
            `
        })
        console.log("Mensaje enviado: ", email.messageId);
    }

    static sendPasswordResetToken = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'Restablece tu contraseña en CashTrackr',
            html: `
            <p>Hola ${user.name}, restablece tu contraseña en CashTrackr</p>
            <p>Visita el siguiente enlace para restablecer tu contraseña:</p>
            <a href="#">Restablecer Contraseña</a>
            <p> e ingresa el codigo: <b>${user.token}</b></p> 
            `
        })
        console.log("Mensaje enviado: ", email.messageId);
    }



}