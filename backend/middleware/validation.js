import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  validateRequest
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['coffee', 'spices', 'food', 'clothing', 'crafts', 'other'])
    .withMessage('Invalid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  validateRequest
];

export const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Shipping address name is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Shipping address street is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('Shipping address city is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Shipping address country is required'),
  validateRequest
];

export const validateProductRequest = [
  body('productUrl')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid product URL'),
  body('productName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('productPrice')
    .trim()
    .notEmpty()
    .withMessage('Product price is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('category')
    .isIn(['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'other'])
    .withMessage('Invalid category'),
  body('urgency')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid urgency level'),
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Shipping address name is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Shipping address street is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('Shipping address city is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Shipping address country is required'),
  validateRequest
];