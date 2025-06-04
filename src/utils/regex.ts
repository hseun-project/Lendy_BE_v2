import { isEmail } from 'validator';

export const checkMailRegex = (email: string): boolean => {
  return email.length <= 32 && isEmail(email);
};

export const checkPasswordRegex = (password: string): boolean => {
  const passwordPattern = /^[\w!@#$%^&*]{8,20}$/;
  return passwordPattern.test(password);
};
