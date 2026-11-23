export function onlyDigits(value: string, limit: number) { return value.replace(/\D/g, '').slice(0, limit) }

export function maskCnpj(value: string) {
  const d = onlyDigits(value, 14)
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4').replace(/(\d{4})(\d)/, '$1-$2')
}

export function maskPhone(value: string) {
  const d = onlyDigits(value, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  const area = `(${d.slice(0, 2)}) `
  const number = d.slice(2)
  return area + (d.length > 10 ? number.replace(/^(\d{5})(\d{0,4})$/, '$1-$2') : number.replace(/^(\d{4})(\d{0,4})$/, '$1-$2'))
}

export function isValidCnpj(value: string) {
  const cnpj = onlyDigits(value, 14)
  if (cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false
  const digit = (base: string, weights: number[]) => {
    const sum = [...base].reduce((acc, n, i) => acc + Number(n) * weights[i], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  return digit(cnpj.slice(0, 12), [5,4,3,2,9,8,7,6,5,4,3,2]) === Number(cnpj[12]) && digit(cnpj.slice(0, 13), [6,5,4,3,2,9,8,7,6,5,4,3,2]) === Number(cnpj[13])
}

export function slugFromName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
