import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const keyLength = 64
const scryptAsync = promisify(scrypt)

export const hash = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, keyLength)
  return `${salt}.${(derivedKey as Buffer).toString('hex')}`
}

export const compare = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const [salt, hashKey] = hash.split('.')
  const hashKeyBuff = Buffer.from(hashKey, 'hex')
  const derivedKey = await scryptAsync(password, salt, keyLength)
  return timingSafeEqual(hashKeyBuff, derivedKey as Buffer)
}
