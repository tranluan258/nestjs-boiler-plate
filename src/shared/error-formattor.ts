import { ValidationError } from '@nestjs/common';

export const errorFormatter = (
  errors: ValidationError[],
  errMessage?: any,
  parentField?: string,
): any => {
  const result = errMessage || [];
  let errorField = '';
  let validationList;
  errors.forEach((error) => {
    errorField = parentField
      ? `${parentField}.${error.property}`
      : error.property;
    if (!error.constraints && error.children.length) {
      errorFormatter(error.children, result, errorField);
    } else {
      validationList = Object.values(error.constraints);
      validationList.length > 0
        ? result.push(validationList.pop())
        : 'Invalid value';
    }
  });

  return result;
};
