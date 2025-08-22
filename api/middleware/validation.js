const { body, validationResult } = require('express-validator');

// Validações para registro de estudante
const validateStudentRegistration = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras e espaços'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('telefone')
    .matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
    .withMessage('Telefone deve estar no formato (XX) XXXXX-XXXX'),
  
  body('cidade')
    .notEmpty()
    .withMessage('Cidade é obrigatória'),
  
  body('habilidades')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Habilidades devem ter entre 10 e 1000 caracteres')
];

// Validações para registro de empresa
const validateCompanyRegistration = [
  body('nomeEmpresa')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome da empresa deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('cidade')
    .notEmpty()
    .withMessage('Cidade é obrigatória')
];

// Validações para login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Middleware para verificar erros de validação
const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateStudentRegistration,
  validateCompanyRegistration,
  validateLogin,
  checkValidationErrors
};