import type { Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import Budget from '../models/Budget'



declare global {
    namespace Express {
        interface Request {
            budget?: Budget
        }
    }
}


export const validateBudgetId = async (req: Request, res: Response, next: NextFunction) => {

    await param('budgetId')
        .isInt().withMessage('El ID debe ser un número entero')
        .custom(value => value > 0)
        .withMessage('El ID debe ser mayor que cero')
        .run(req)
    next()
}


export const validateBudgetExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { budgetId } = req.params
        const budget = await Budget.findByPk(budgetId)
        if (!budget) {
            const error = new Error('Presupuesto no encontrado')
            return res.status(404).json({ error: error.message })
        }
        req.budget = budget
        next()
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error' })
    }
}

export const validateBudgetInput = async (req: Request, res: Response, next: NextFunction) => {

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
