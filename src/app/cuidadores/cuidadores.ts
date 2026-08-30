import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Cuidador {
id: number;
nombre: string;
documento: string;
telefono: string;
correo: string;
fechaNacimiento: string;
especialidad: string;
licencia: string;
experiencia: number | null;
institucion: string;
turno: string;
pacientes: number;
estado: 'activo' | 'inactivo';
diasDisponibles: string[];
disponible: boolean;
}

interface FormularioCuidador {
nombre: string;
documento: string;
telefono: string;
correo: string;
fechaNacimiento: string;
especialidad: string;
licencia: string;
experiencia: number | null;
institucion: string;
}

type TipoArchivo =
| 'cedula'
| 'tarjetaProfesional'
| 'antecedentes'
| 'hojaVida';

@Component({
selector: 'app-cuidadores',
standalone: true,
imports: [
CommonModule,
FormsModule
],
templateUrl: './cuidadores.html',
styleUrl: './cuidadores.css'
})
export class Cuidadores {

/* =====================================================
DATOS
===================================================== */

cuidadores: Cuidador[] = [];

cuidadoresFiltrados: Cuidador[] = [];

/* =====================================================
CONFIGURACIÓN DE LA INTERFAZ
===================================================== */

readonly diasSemana: string[] = [
'Lunes',
'Martes',
'Miércoles',
'Jueves',
'Viernes',
'Sábado',
'Domingo'
];

readonly turnosDisponibles = [
{
nombre: 'Mañana',
horario: '06:00 - 14:00'
},
{
nombre: 'Tarde',
horario: '14:00 - 22:00'
},
{
nombre: 'Noche',
horario: '22:00 - 06:00'
}
];

readonly coloresAvatar: string[] = [
'#3B5BDB',
'#4DABF7',
'#7950F2',
'#F03E3E',
'#2F9E44',
'#E67700',
'#C2255C'
];

/* =====================================================
FILTROS
===================================================== */

textoBusqueda = '';

estadoSeleccionado = '';

ordenNombre: 'asc' | 'desc' = 'asc';

/* =====================================================
DROPDOWN
===================================================== */

menuAbiertoId: number | null = null;

/* =====================================================
MODAL FORMULARIO
===================================================== */

formularioAbierto = false;

modoFormulario: 'crear' | 'editar' = 'crear';

cuidadorEditandoId: number | null = null;

/* =====================================================
MODAL DETALLE
===================================================== */

detalleAbierto = false;

cuidadorSeleccionado: Cuidador | null = null;

/* =====================================================
MODAL CONFIRMACIÓN
===================================================== */

confirmacionAbierta = false;

cuidadorEliminarId: number | null = null;

/* =====================================================
FORMULARIO
===================================================== */

formulario: FormularioCuidador = this.crearFormularioVacio();

turnoSeleccionado = '';

diasSeleccionados: string[] = [];

erroresFormulario: Record<string, boolean> = {};

guardando = false;

/* =====================================================
ARCHIVOS
===================================================== */

archivos: Record<TipoArchivo, File | null> = {
cedula: null,
tarjetaProfesional: null,
antecedentes: null,
hojaVida: null
};

/* =====================================================
CONSTRUCTOR
===================================================== */

constructor() {
this.cuidadoresFiltrados = [];
}

/* =====================================================
FORMULARIO VACÍO
===================================================== */

crearFormularioVacio(): FormularioCuidador {
return {
nombre: '',
documento: '',
telefono: '',
correo: '',
fechaNacimiento: '',
especialidad: '',
licencia: '',
experiencia: null,
institucion: ''
};
}

/* =====================================================
ESTADÍSTICAS
===================================================== */

get totalCuidadores(): number {
return this.cuidadores.length;
}

get cuidadoresActivos(): number {
return this.cuidadores.filter(
cuidador => cuidador.estado === 'activo'
).length;
}

get cuidadoresInactivos(): number {
return this.cuidadores.filter(
cuidador => cuidador.estado === 'inactivo'
).length;
}

get cuidadoresDisponibles(): number {
return this.cuidadores.filter(
cuidador =>
cuidador.estado === 'activo' &&
cuidador.disponible
).length;
}

/* =====================================================
FILTROS
===================================================== */

buscarCuidadores(): void {
this.aplicarFiltros();
}

filtrarCuidadores(): void {
this.aplicarFiltros();
}

ordenarCuidadores(): void {
this.ordenNombre =
this.ordenNombre === 'asc'
? 'desc'
: 'asc';


this.aplicarFiltros();


}

private aplicarFiltros(): void {
let resultado = [...this.cuidadores];


const texto = this.textoBusqueda
  .trim()
  .toLowerCase();

if (texto) {
  resultado = resultado.filter(
    cuidador =>
      cuidador.documento
        .toLowerCase()
        .includes(texto)
  );
}

if (this.estadoSeleccionado) {
  resultado = resultado.filter(
    cuidador =>
      cuidador.estado === this.estadoSeleccionado
  );
}

resultado.sort((primerCuidador, segundoCuidador) => {
  const nombreA =
    primerCuidador.nombre.toLowerCase();

  const nombreB =
    segundoCuidador.nombre.toLowerCase();

  const comparacion =
    nombreA.localeCompare(
      nombreB,
      'es',
      {
        sensitivity: 'base'
      }
    );

  return this.ordenNombre === 'asc'
    ? comparacion
    : -comparacion;
});

this.cuidadoresFiltrados = resultado;


}

/* =====================================================
AVATAR
===================================================== */

obtenerIniciales(nombre: string): string {
if (!nombre?.trim()) {
return '??';
}


return nombre
  .trim()
  .split(/\s+/)
  .map(palabra => palabra.charAt(0))
  .join('')
  .toUpperCase()
  .slice(0, 2);


}

obtenerColorAvatar(id: number): string {
if (!this.coloresAvatar.length) {
return '#3B5BDB';
}

return this.coloresAvatar[
  Math.abs(id - 1) % this.coloresAvatar.length
];


}

/* =====================================================
DETALLE
===================================================== */

verDetalle(cuidador: Cuidador): void {
this.cuidadorSeleccionado = cuidador;
this.detalleAbierto = true;
}

cerrarDetalle(): void {
this.detalleAbierto = false;
this.cuidadorSeleccionado = null;
}

cerrarDetallePorOverlay(evento: MouseEvent): void {
if (
evento.target ===
evento.currentTarget
) {
this.cerrarDetalle();
}
}

/* =====================================================
DROPDOWN
===================================================== */

abrirMenuAcciones(
evento: MouseEvent,
id: number
): void {
evento.stopPropagation();


this.menuAbiertoId =
  this.menuAbiertoId === id
    ? null
    : id;


}

cerrarMenuAcciones(): void {
this.menuAbiertoId = null;
}

/* =====================================================
FORMULARIO
===================================================== */

abrirFormulario(
modo: 'crear' | 'editar',
id?: number
): void {
this.cerrarMenuAcciones();


this.limpiarFormulario();

this.modoFormulario = modo;

if (
  modo === 'editar' &&
  id !== undefined
) {
  const cuidador =
    this.cuidadores.find(
      elemento => elemento.id === id
    );

  if (!cuidador) {
    return;
  }

  this.cuidadorEditandoId = id;

  this.formulario = {
    nombre: cuidador.nombre,
    documento: cuidador.documento,
    telefono: cuidador.telefono,
    correo: cuidador.correo,
    fechaNacimiento: cuidador.fechaNacimiento,
    especialidad: cuidador.especialidad,
    licencia: cuidador.licencia,
    experiencia: cuidador.experiencia,
    institucion: cuidador.institucion
  };

  this.turnoSeleccionado =
    cuidador.turno;

  this.diasSeleccionados =
    [...cuidador.diasDisponibles];
}

this.formularioAbierto = true;


}

cerrarFormulario(): void {
this.formularioAbierto = false;
this.limpiarFormulario();
}

cerrarFormularioPorOverlay(
evento: MouseEvent
): void {
if (
evento.target ===
evento.currentTarget
) {
this.cerrarFormulario();
}
}

limpiarFormulario(): void {
this.formulario =
this.crearFormularioVacio();


this.turnoSeleccionado = '';

this.diasSeleccionados = [];

this.erroresFormulario = {};

this.guardando = false;

this.cuidadorEditandoId = null;

this.archivos = {
  cedula: null,
  tarjetaProfesional: null,
  antecedentes: null,
  hojaVida: null
};


}

/* =====================================================
VALIDACIÓN
===================================================== */

validarFormulario(): boolean {
this.erroresFormulario = {};


let formularioValido = true;

const camposObligatorios:
  Array<keyof FormularioCuidador> = [
    'nombre',
    'documento',
    'telefono',
    'correo',
    'especialidad',
    'licencia'
  ];

camposObligatorios.forEach(
  campo => {
    const valor =
      this.formulario[campo];

    if (
      typeof valor !== 'string' ||
      !valor.trim()
    ) {
      this.erroresFormulario[campo] =
        true;

      formularioValido = false;
    }
  }
);

return formularioValido;


}

tieneError(campo: string): boolean {
return this.erroresFormulario[campo] === true;
}

/* =====================================================
GUARDAR
===================================================== */

guardarCuidador(): void {
if (this.guardando) {
return;
}


if (!this.validarFormulario()) {
  return;
}

/*
  ESTE MÉTODO QUEDA PREPARADO
  PARA CONECTAR EL SERVICE.

  Cuando creemos CuidadoresService,
  aquí se realizará el POST o PUT
  correspondiente a la API.
*/

console.log(
  'Datos preparados para enviar a la API:',
  this.formulario
);

console.log(
  'Turno:',
  this.turnoSeleccionado
);

console.log(
  'Días:',
  this.diasSeleccionados
);

console.log(
  'Archivos:',
  this.archivos
);

}

/* =====================================================
TURNOS
===================================================== */

seleccionarTurno(turno: string): void {
this.turnoSeleccionado = turno;
}

/* =====================================================
DÍAS
===================================================== */

cambiarDia(dia: string): void {
if (
this.diasSeleccionados.includes(dia)
) {
this.diasSeleccionados =
this.diasSeleccionados.filter(
elemento => elemento !== dia
);


  return;
}

this.diasSeleccionados.push(dia);

}

estaSeleccionadoElDia(
dia: string
): boolean {
return this.diasSeleccionados.includes(dia);
}

/* =====================================================
ARCHIVOS
===================================================== */

seleccionarArchivo(
evento: Event,
tipo: TipoArchivo
): void {
const input =
evento.target as HTMLInputElement;


if (
  input.files &&
  input.files.length > 0
) {
  this.archivos[tipo] =
    input.files[0];
}


}

archivoSeleccionado(
tipo: TipoArchivo
): boolean {
return this.archivos[tipo] !== null;
}

obtenerNombreArchivo(
tipo: TipoArchivo
): string {
return this.archivos[tipo]?.name ?? '';
}

/* =====================================================
ESTADO
===================================================== */

cambiarEstado(id: number): void {
const cuidador =
this.cuidadores.find(
elemento => elemento.id === id
);


if (!cuidador) {
  return;
}

cuidador.estado =
  cuidador.estado === 'activo'
    ? 'inactivo'
    : 'activo';

if (
  cuidador.estado === 'inactivo'
) {
  cuidador.disponible = false;
}

this.aplicarFiltros();

this.cerrarMenuAcciones();


}

/* =====================================================
DISPONIBILIDAD
===================================================== */

cambiarDisponibilidad(id: number): void {
const cuidador =
this.cuidadores.find(
elemento => elemento.id === id
);


if (!cuidador) {
  return;
}

if (
  cuidador.estado === 'inactivo'
) {
  cuidador.disponible = false;
  return;
}

cuidador.disponible =
  !cuidador.disponible;

this.aplicarFiltros();


}

/* =====================================================
ELIMINAR
===================================================== */

solicitarEliminacion(id: number): void {
this.cerrarMenuAcciones();


this.cuidadorEliminarId = id;

this.confirmacionAbierta = true;


}

cerrarConfirmacion(): void {
this.confirmacionAbierta = false;
this.cuidadorEliminarId = null;
}

confirmarEliminacion(): void {
if (
this.cuidadorEliminarId === null
) {
return;
}


/*
  ESTE MÉTODO QUEDA PREPARADO
  PARA EL DELETE DE LA API.

  Cuando conectemos el service:
  this.cuidadoresService.eliminar(...)
*/

this.cerrarConfirmacion();

}

obtenerNombreCuidadorEliminar(): string {
if (
this.cuidadorEliminarId === null
) {
return '';
}


const cuidador =
  this.cuidadores.find(
    elemento =>
      elemento.id ===
      this.cuidadorEliminarId
  );

return cuidador?.nombre ?? '';

}

cancelarFormulario(): void {
this.cerrarFormulario();
}
}
