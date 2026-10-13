import { describe, expect, it } from 'vitest'
import { TIPO_MOVIMIENTO, type TipoMovimiento } from '@/config/constantes'
import {
  categoriaTieneMovimientosAsociados,
  validarNombreCategoria,
} from '@/models/reglas/validacionesCategoria'
import { validarDatosIngreso } from '@/models/reglas/validacionesIngreso'
import { esFormularioValido, validarDatosMovimiento } from '@/models/reglas/validacionesMovimiento'
import { crearMovimientoDePrueba } from '../fabricas'

const fechaReferencia = new Date(2026, 9, 12, 23, 30) // 12-10-2026, 23:30 hora local

const datosValidos = {
  tipo: TIPO_MOVIMIENTO.GASTO,
  monto: 15000,
  fecha: '2026-10-12',
  identificadorCategoria: 'alimentacion',
  descripcion: 'Supermercado',
}

describe('validarDatosMovimiento', () => {
  it('acepta datos válidos', () => {
    const errores = validarDatosMovimiento(datosValidos, fechaReferencia)
    expect(errores).toEqual({})
    expect(esFormularioValido(errores)).toBe(true)
  })

  it.each([0, -10, 10.5, Number.NaN])('rechaza el monto %s', (monto) => {
    expect(validarDatosMovimiento({ ...datosValidos, monto }, fechaReferencia).monto).toBeDefined()
  })

  it('rechaza fechas futuras usando la fecha local, no UTC', () => {
    expect(
      validarDatosMovimiento({ ...datosValidos, fecha: '2026-10-13' }, fechaReferencia).fecha,
    ).toBe('La fecha no puede ser futura.')
  })

  it('exige fecha, categoría y tipo válido', () => {
    const errores = validarDatosMovimiento(
      {
        ...datosValidos,
        fecha: '',
        identificadorCategoria: '',
        tipo: 'OTRO' as TipoMovimiento,
      },
      fechaReferencia,
    )
    expect(Object.keys(errores).sort()).toEqual(['fecha', 'identificadorCategoria', 'tipo'])
    expect(esFormularioValido(errores)).toBe(false)
  })

  it('limita la descripción a 120 caracteres', () => {
    expect(
      validarDatosMovimiento({ ...datosValidos, descripcion: 'a'.repeat(120) }, fechaReferencia),
    ).toEqual({})
    expect(
      validarDatosMovimiento({ ...datosValidos, descripcion: 'a'.repeat(121) }, fechaReferencia)
        .descripcion,
    ).toBeDefined()
  })
})

describe('validarNombreCategoria', () => {
  const categorias = [
    { identificador: 'salud', nombre: 'Salud' },
    { identificador: 'otros', nombre: 'Otros' },
  ]

  it('acepta un nombre nuevo', () => {
    expect(validarNombreCategoria('Mascotas', categorias)).toBeNull()
  })

  it('rechaza nombres vacíos o demasiado largos', () => {
    expect(validarNombreCategoria('   ', categorias)).not.toBeNull()
    expect(validarNombreCategoria('a'.repeat(41), categorias)).not.toBeNull()
  })

  it('rechaza duplicados sin importar mayúsculas ni tildes', () => {
    expect(validarNombreCategoria('salúd', categorias)).toBe(
      'Ya existe una categoría con ese nombre.',
    )
  })

  it('permite conservar el mismo nombre al renombrar', () => {
    expect(validarNombreCategoria('Salud', categorias, 'salud')).toBeNull()
  })
})

describe('categoriaTieneMovimientosAsociados', () => {
  it('detecta si una categoría está en uso', () => {
    const movimientos = [crearMovimientoDePrueba({ identificadorCategoria: 'salud' })]
    expect(categoriaTieneMovimientosAsociados('salud', movimientos)).toBe(true)
    expect(categoriaTieneMovimientosAsociados('otros', movimientos)).toBe(false)
  })
})

describe('validarDatosIngreso', () => {
  it('exige usuario y contraseña de largo mínimo', () => {
    expect(validarDatosIngreso({ nombreUsuario: ' ', contrasena: '123' })).toEqual({
      nombreUsuario: expect.any(String),
      contrasena: expect.any(String),
    })
    expect(validarDatosIngreso({ nombreUsuario: 'camilo', contrasena: '1234' })).toEqual({})
  })
})
