import { hash } from "bcryptjs";

const clave = process.argv[2];
if (!clave) {
  console.error("Uso: npm run hash-clave -- <clave>");
  process.exit(1);
}

const hashed = await hash(clave, 10);
console.log(hashed);
