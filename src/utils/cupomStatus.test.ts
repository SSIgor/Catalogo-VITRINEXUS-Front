import { describe, expect, it } from 'vitest'
import { getCupomStatus, normalizarCodigoCupom } from './cupomStatus'

describe('cupomStatus', () => {
  it('normaliza o código do cupom', () => {
    expect(normalizarCodigoCupom('  imura10  ')).toBe('IMURA10')
  })

  it('marca cupom ativo quando está válido e não inativo', () => {
    expect(getCupomStatus({ inativo: false, dataValidade: '2099-12-31T23:59:59' })).toBe('Ativo')
  })

  it('marca cupom expirado quando a data passou', () => {
    expect(getCupomStatus({ inativo: false, dataValidade: '2020-01-01T00:00:00' })).toBe('Expirado')
  })

  it('marca cupom inativo quando a flag indica inativo', () => {
    expect(getCupomStatus({ inativo: true, dataValidade: '2099-12-31T23:59:59' })).toBe('Inativo')
  })
})
