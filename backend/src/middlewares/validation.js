import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response.js';

export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[target];

      // Parse và validate với schema
      const validatedData = schema.parse(dataToValidate);

      // Ghi đè từng field thay vì gán cả object
      Object.assign(req[target], validatedData);

      next();
    } catch (error) {
      console.log('❌ [Validate] Failed', error);
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return sendError(res, 'Dữ liệu không hợp lệ', StatusCodes.BAD_REQUEST, {
          validationErrors: formattedErrors,
        });
      }

      next(error);
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');

export const validateQuery = (schema) => validate(schema, 'query');

export const validateParams = (schema) => validate(schema, 'params');
