/**
 * Descarga un texto como archivo en el navegador.
 *
 * @param nombreArchivo Nombre sugerido del archivo.
 * @param contenido Texto del archivo.
 * @param tipoMime Tipo MIME del archivo.
 * @returns No retorna valor.
 */
export function descargarArchivoTexto(
  nombreArchivo: string,
  contenido: string,
  tipoMime = 'text/csv;charset=utf-8',
): void {
  // El BOM permite que Excel reconozca los tildes en UTF-8.
  const archivo = new Blob(['﻿', contenido], { type: tipoMime })
  const urlArchivo = URL.createObjectURL(archivo)
  const enlaceDescarga = document.createElement('a')
  enlaceDescarga.href = urlArchivo
  enlaceDescarga.download = nombreArchivo
  enlaceDescarga.click()
  URL.revokeObjectURL(urlArchivo)
}
