// /scripts/create-admin.mjs
// Crea (o cambia la contraseña de) un usuario del panel.
// Uso: npm run create-admin
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../server/config/db.js';
import { User } from '../server/models/User.js';

const rl = readline.createInterface({ input: stdin, output: stdout });

// Pregunta ocultando lo que se escribe (para la contraseña)
const askHidden = async (question) => {
  const originalWrite = rl._writeToOutput;
  rl._writeToOutput = (text) => {
    if (text.includes(question)) originalWrite.call(rl, text);
    else originalWrite.call(rl, '*');
  };
  const answer = await rl.question(question);
  rl._writeToOutput = originalWrite;
  stdout.write('\n');
  return answer;
};

try {
  const email = (process.env.ADMIN_EMAIL || await rl.question('Email: ')).trim().toLowerCase();
  const name = process.env.ADMIN_NAME ?? (await rl.question('Nombre (opcional): ')).trim();
  const password = process.env.ADMIN_PASSWORD || await askHidden('Contraseña (mínimo 10 caracteres): ');

  if (!email.includes('@')) throw new Error('Email inválido');
  if (password.length < 10) throw new Error('La contraseña debe tener al menos 10 caracteres');

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });
  if (existing) {
    existing.passwordHash = passwordHash;
    if (name) existing.name = name;
    await existing.save();
    console.log(`✔ Contraseña actualizada para ${email}`);
  } else {
    await User.create({ email, name, passwordHash });
    console.log(`✔ Usuario creado: ${email}`);
  }
} catch (error) {
  console.error(`✖ ${error.message}`);
  process.exitCode = 1;
} finally {
  rl.close();
  await mongoose.disconnect();
}
