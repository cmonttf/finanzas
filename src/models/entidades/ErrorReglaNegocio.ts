/** Error lanzado cuando una operación infringe una regla de negocio. */
export class ErrorReglaNegocio extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ErrorReglaNegocio'
  }
}
