#!/usr/bin/env node
/**
 * EduBuds — CMS Credential Helper
 * Generate password hashes and random JWT secrets for your Vercel deployment.
 *
 * Usage:
 *   node scripts/generate-hash.js <your-chosen-password>
 *   node scripts/generate-hash.js --secret
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const arg = process.argv[2];

if (arg === '--secret') {
  const secret = crypto.randomBytes(48).toString('base64');
  console.log('\n🔐  Generated JWT_SECRET:');
  console.log('────────────────────────────────────────────────────');
  console.log(`JWT_SECRET=${secret}`);
  console.log('────────────────────────────────────────────────────\n');
  process.exit(0);
}

if (!arg) {
  console.log('\n📖  EduBuds CMS Credential Helper\n');
  console.log('  To generate a password hash:');
  console.log('    node scripts/generate-hash.js <your-password>\n');
  console.log('  To generate a random JWT secret:');
  console.log('    node scripts/generate-hash.js --secret\n');
  process.exit(1);
}

if (arg.length < 8) {
  console.error('\n❌  Password must be at least 8 characters long.\n');
  process.exit(1);
}

console.log('\n⏳  Generating bcrypt hash (salt rounds: 12)...');
const hash = await bcrypt.hash(arg, 12);
const secret = crypto.randomBytes(48).toString('base64');

console.log('\n✅  Credentials generated successfully!\n');
console.log('────────────────────────────────────────────────────');
console.log('Add these to your Vercel Project Settings > Environment Variables:');
console.log('────────────────────────────────────────────────────\n');
console.log(`ADMIN_USERNAME=edubuds_admin`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log(`JWT_SECRET=${secret}\n`);
console.log('────────────────────────────────────────────────────\n');
