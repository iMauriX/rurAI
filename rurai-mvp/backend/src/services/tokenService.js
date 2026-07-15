import { customAlphabet } from 'nanoid';

// Generador de tokens cortos amigables de 6 caracteres (mayúsculas y números)
const generateShortToken = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export const generateUniqueToken = (dbActividades) => {
  let token;
  let isUnique = false;
  
  while (!isUnique) {
    token = generateShortToken();
    const exists = dbActividades.some(act => act.tokenCorto === token);
    if (!exists) {
      isUnique = true;
    }
  }
  
  return token;
};
