import { Request, Response, NextFunction } from "express"
import { param, validationResult, body } from "express-validator"




export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {

    await body('name')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .run(req)
    await body('amount')
        .notEmpty()
        .withMessage('El monto es obligatorio')
        .isNumeric()
        .withMessage('El monto debe ser un número')
        .custom(value => value > 0)
        .withMessage('El monto debe ser mayor que cero')
        .run(req)
    next()
}