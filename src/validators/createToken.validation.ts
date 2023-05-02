import Joi from "joi";

const currentYear = new Date().getFullYear();
const maxYear = currentYear + 5;

function validateCardNumber(cardNumber: number): boolean {
  const cardNumberString = cardNumber.toString();
  let sum = 0;
  let doubleUp = false;
  for (let i = cardNumberString.length - 1; i >= 0; i--) {
    let curDigit = parseInt(cardNumberString.charAt(i));
    if (doubleUp) {
      if ((curDigit *= 2) > 9) curDigit -= 9;
    }
    sum += curDigit;
    doubleUp = !doubleUp;
  }
  return sum % 10 == 0;
}


export const createToken = {
  query: Joi.object().keys({
    card_number: Joi.number().min(1000000000000).max(9999999999999999).required().custom((value, helpers) => {
      if (!validateCardNumber(value)) {
        return helpers.message({custom:'Invalid credit card number'});
      }
      return value;
    }),
    cvv: Joi.number().min(100).max(9999).required(),
    expiration_month: Joi.string().length(2).regex(/^(0[1-9]|1[0-2])$/).required().messages({
      'string.length': 'Expiration month must be 2 characters long',
      'string.pattern.base': 'Expiration month must be between 01 and 12',
      'string.empty': 'Expiration month is required',
    }),
    expiration_year: Joi.string().length(4)
    .custom((value, helpers) => {
      const currentYear = new Date().getFullYear();
      const year = parseInt(value, 10);
      if (year < currentYear || year > currentYear + 5) {
        return helpers.message({ custom: "Invalid expiration year" });
      }
      return value;
    })
    .required()
    .messages({
      'string.length': 'Expiration year must be 4 characters long',
      'string.empty': ' Expiration year is required',
    }),
    email: Joi.string().min(5).max(100)
      .email({ tlds: { allow: false } })
      .regex(/@(hotmail|gmail|yahoo)\.(com|es)$/)
      .required().messages({
          'string.email': 'Please enter a valid email address',
          'string.empty': 'Email is required',
          'any.required': 'Email is required'
        })
  }),
};


export const tokenSchema = Joi.string().length(16);

export const getCardDataSchema = Joi.object({
  authorization: Joi.string().required().messages({
    'any.required': 'Authorization is required',
    'string.empty': 'Authorization cannot be empty',
  }),
}).unknown(false);