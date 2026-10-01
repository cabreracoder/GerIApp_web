
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


// =====================================================
// INTERFACES
// =====================================================

interface Encargado {
  id: number;
  tipoDocumento: string;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaIngreso: string;
  fechaNacimiento?: string;
  edad?: number;
  especialidad?: string;
  licencia?: string;
  experiencia?: string;
  institucion?: string;
  estado: 'Activo' | 'Inactivo';
  iniciales: string;
  foto?: string;
}

interface FormularioEncargado {
  tipoDocumento: string;
  documento: string;
  nombres: string;
  apellidos: string;
  estado: 'Activo' | 'Inactivo';
  fechaIngreso: string;
  fechaNacimiento?: string;
  edad?: number;
  telefono: string;
  email: string;
  especialidad?: string;
  licencia?: string;
  experiencia?: string;
  institucion?: string;
  cedulaFile?: File | null;
  hojaDeVidaFile?: File | null;
  tarjetaProfesionalFile?: File | null;
  antecedentesFile?: File | null;

}

interface ErroresFormulario {
  tipoDocumento: boolean;
  documento: boolean;
  nombres: boolean;
  apellidos: boolean;
  telefono: boolean;
  email: boolean;
  emailInvalido?: boolean;
}

// =====================================================
// ALERTAS (SweetAlert2 + Tailwind)
// =====================================================

type Tono = 'rojo' | 'ambar' | 'azul' | 'verde';

const TONOS: Record<Tono, { panel: string; boton: string }> = {
  rojo: { panel: 'bg-linear-to-b from-red-500 to-red-700', boton: 'bg-red-600 hover:bg-red-700' },
  ambar: { panel: 'bg-linear-to-b from-amber-500 to-amber-700', boton: 'bg-amber-600 hover:bg-amber-700' },
  azul: { panel: 'bg-linear-to-b from-blue-500 to-blue-700', boton: 'bg-blue-600 hover:bg-blue-700' },
  verde: { panel: 'bg-linear-to-b from-emerald-500 to-emerald-700', boton: 'bg-emerald-600 hover:bg-emerald-700' },
};

// Iconos blancos del panel (papelera, prohibido, lápiz, check, equis, alerta)
const svgIcono = (trazos: string): string =>
  `<svg class="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`;

const ICONOS = {
  papelera: svgIcono('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  prohibido: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'),
  lapiz: svgIcono('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'),
  check: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  equis: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  alerta: svgIcono('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
};

// Evita que un nombre del backend inyecte HTML
function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inicialesAlerta(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

interface ConfigAlerta {
  tono: Tono;
  icono: 'warning' | 'question' | 'success' | 'error';
  iconoSvg: string;
  titulo: string;
  html?: string;
  confirmar: string;
  cancelar?: string;
  confirmarIzquierda?: boolean;   // true = "Sí, ..." a la izquierda (como en Editar)
  enfocarCancelar?: boolean;
  autoCerrar?: boolean;           // true = sin botones, se cierra a los 1,8 s
}

// Motor único: todas las alertas pasan por aquí.
// Las clases con "!" ganan sobre el CSS que SweetAlert2 trae por defecto.
function mostrarAlerta(c: ConfigAlerta) {

  const tono = TONOS[c.tono];
  const conBotones = !c.autoCerrar;
  const conCancelar = !!c.cancelar;
  const botonSolo = conBotones && !conCancelar;
  const tituloSinPie = !conBotones && !c.html;

  return Swal.fire({
    icon: c.icono,
    iconHtml: c.iconoSvg,
    title: escaparHtml(c.titulo),
    html: c.html,

    showConfirmButton: conBotones,
    showCancelButton: conCancelar,
    confirmButtonText: c.confirmar,
    cancelButtonText: c.cancelar,
    reverseButtons: !c.confirmarIzquierda,
    focusCancel: !!c.enfocarCancelar,
    timer: c.autoCerrar ? 1800 : undefined,

    buttonsStyling: false,
    backdrop: 'rgba(15, 23, 42, 0.65)',

    customClass: {
      popup: '!grid-cols-[26%_1fr] !w-[34rem] !max-w-[92vw] !p-0 !rounded-[2.2rem] !overflow-hidden !bg-white',
      icon: `col-start-1 row-start-1 row-span-3 !m-0 !flex !h-auto !w-auto !items-center !justify-center !rounded-none !border-0 !animate-none ${tono.panel}`,
      title: `col-start-2 row-start-1 !m-0 !px-7 !pt-8 ${tituloSinPie ? '!pb-8' : '!pb-0'} !text-left !text-[1.6rem] !leading-tight !font-extrabold !text-slate-900`,
      htmlContainer: `col-start-2 row-start-2 !m-0 !px-7 !pt-0 ${conBotones ? '!pb-0' : '!pb-8'} !justify-start !overflow-visible !text-left !text-base !font-normal`,
      actions: `col-start-2 row-start-3 !m-0 !w-auto !flex-nowrap !gap-3 !px-7 !pt-6 !pb-8 ${botonSolo ? '!justify-end' : '!justify-stretch'}`,
      confirmButton: `${botonSolo ? 'w-[calc(50%-0.375rem)]' : 'flex-1'} cursor-pointer rounded-2xl px-4 py-3 text-[1.1rem] font-bold text-white transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 ${tono.boton}`,
      cancelButton: 'flex-1 cursor-pointer rounded-2xl bg-slate-100 px-4 py-3 text-[1.1rem] font-bold text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300',
    },
  });
}

// ---- Confirmaciones: subtítulo gris + avatar con iniciales + pregunta ----

function alertaConfirmar(c: {
  tono: Tono;
  icono: 'warning' | 'question';
  iconoSvg: string;
  verbo: string;
  entidad: string;
  nombre: string;
  subtitulo: string;
  confirmar: string;
  confirmarIzquierda?: boolean;
  enfocarCancelar?: boolean;
}) {

  const html = `
    <p class="m-0 text-[1.1rem] leading-snug text-slate-400">${escaparHtml(c.subtitulo)}</p>
    <div class="mt-4 flex items-center gap-3.5">
      <span class="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">${escaparHtml(inicialesAlerta(c.nombre))}</span>
      <p class="m-0 text-[1.15rem] leading-snug text-slate-700">¿${c.verbo} a <strong class="font-bold">${escaparHtml(c.nombre)}</strong>?</p>
    </div>
  `;

  return mostrarAlerta({
    tono: c.tono,
    icono: c.icono,
    iconoSvg: c.iconoSvg,
    titulo: `${c.verbo} ${c.entidad}`,
    html,
    confirmar: c.confirmar,
    cancelar: 'Cancelar',
    confirmarIzquierda: c.confirmarIzquierda,
    enfocarCancelar: c.enfocarCancelar,
  });
}

// Imagen 1: rojo
function alertaEliminar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'rojo', icono: 'warning', iconoSvg: ICONOS.papelera,
    verbo: 'Eliminar', entidad, nombre,
    subtitulo: 'Acción permanente · no se puede deshacer',
    confirmar: 'Sí, eliminar',
    enfocarCancelar: true,
  });
}

// Imagen 2: ámbar
function alertaDesactivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.prohibido,
    verbo: 'Desactivar', entidad, nombre,
    subtitulo: 'Cambio reversible · puedes reactivarlo luego',
    confirmar: 'Sí, desactivar',
  });
}

// Imagen 3: azul ("Sí, editar" va a la izquierda)
function alertaEditar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'azul', icono: 'question', iconoSvg: ICONOS.lapiz,
    verbo: 'Editar', entidad, nombre,
    subtitulo: 'Se abrirá el formulario de edición',
    confirmar: 'Sí, editar',
    confirmarIzquierda: true,
  });
}

// Misma forma que Editar, en verde
function alertaActivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'verde', icono: 'question', iconoSvg: ICONOS.check,
    verbo: 'Activar', entidad, nombre,
    subtitulo: 'Volverá a estar activo · puedes desactivarlo luego',
    confirmar: 'Sí, activar',
    confirmarIzquierda: true,
  });
}

// ---- Avisos: mismo panel, título y texto; un solo botón a la derecha ----

function htmlMensaje(mensaje?: string): string | undefined {
  return mensaje
    ? `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">${escaparHtml(mensaje)}</p>`
    : undefined;
}

// Se cierra solo a los 1,8 s (sin botones)
function alertaExito(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'verde', icono: 'success', iconoSvg: ICONOS.check,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar', autoCerrar: true,
  });
}

// Siempre lleva botón, para que no se pierda
function alertaError(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'rojo', icono: 'error', iconoSvg: ICONOS.equis,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
}

function alertaAdvertencia(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.alerta,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
}

// =====================================================
// COMPONENTE
// =====================================================

@Component({
  selector: 'app-encargados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encargados.html',
  styleUrl: './encargados.css',
})
export class Encargados implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  // =====================================================
  // USUARIO RESPONSABLE
  // =====================================================

  usuarioActual = 'Administrador';
  private apiUrl = 'https://geriapp-backend.onrender.com/api/usuarios/';


  // =====================================================
  // ENCARGADOS
  // =====================================================

  encargadoPrincipal: Encargado | null = null;

  encargados: Encargado[] = [];

  encargadosFiltrados: Encargado[] = [];


  // =====================================================
  // PAGINACIÓN
  // =====================================================

  encargadosPaginaActual: Encargado[] = [];

  encargadosPorPagina = 10;

  paginaActual = 1;

  totalPaginas = 1;

  paginas: number[] = [];


  busqueda = '';



  // =====================================================
  // MODAL NUEVO / EDITAR
  // =====================================================

  modalAbierto = false;

  modoEdicion = false;

  editarPrincipal = false;

  idEditando: number | null = null;


  // =====================================================
  // MODAL DETALLES
  // =====================================================

  modalDetallesAbierto = false;

  encargadoSeleccionado: Encargado | null = null;



  // =====================================================
  // ESTADO
  // =====================================================

  guardando = false;

  cargando = false;


  // =====================================================
  // FORMULARIO
  // =====================================================

  formulario: FormularioEncargado = this.formularioInicial();


  // =====================================================
  // ERRORES
  // =====================================================

  errores: ErroresFormulario = {
    tipoDocumento: false,
    documento: false,
    nombres: false,
    apellidos: false,
    telefono: false,
    email: false,
    emailInvalido: false,
  };



  // =====================================================
  // CARGOS Y ÁREAS
  // =====================================================

  cargosDisponibles: string[] = [
    'Director General',
    'Subdirector',
    'Coordinador Administrativo',
    'Coordinador Operativo',
  ];

  areasDisponibles: string[] = [
    'Dirección',
    'Administración',
    'Operaciones',
  ];


  // =====================================================
  // INICIO
  // =====================================================

  constructor() { }

  ngOnInit(): void {
    this.cargarEncargados();
  }


  // =====================================================
  // CARGAR ENCARGADOS
  // =====================================================

  cargarEncargados(): void {


    this.cargando = true;

    this.http.get<any[]>(this.apiUrl).subscribe({

      next: (respuesta: any[]) => {

        this.encargados = respuesta
          .filter((usuario: any) => usuario.id_rol === 6)
          .map((usuario: any): Encargado => ({
            id: usuario.id_usuario,
            tipoDocumento: usuario.tipo_documento,
            documento: usuario.numero_documento,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.correo,
            telefono: usuario.telefono,
            fechaIngreso: usuario.fecha_ingreso,
            estado: usuario.estado ? 'Activo' : 'Inactivo',
            iniciales: this.generarIniciales(`${usuario.nombres} ${usuario.apellidos}`),
          }))
          .sort((a: Encargado, b: Encargado) => a.id - b.id);

        this.encargadoPrincipal = null;

        this.filtrarEncargados();

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: () => {

        this.cargando = false;

        Swal.fire({
          title: 'Error al cargar encargados',
          text: 'No se pudo conectar con el servidor.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB',
        });

        this.cdr.detectChanges();
      },
    });
  }


  // =====================================================
  // FORMULARIO INICIAL
  // =====================================================

  formularioInicial(): FormularioEncargado {


    return {
      tipoDocumento: '',
      documento: '',
      nombres: '',
      apellidos: '',
      estado: 'Inactivo',
      fechaIngreso: '',
      fechaNacimiento: '',
      edad: undefined,
      telefono: '',
      email: '',
      cedulaFile: null,
      hojaDeVidaFile: null,
      especialidad: '',
      licencia: '',
      experiencia: '',
      institucion: '',
      tarjetaProfesionalFile: null,
      antecedentesFile: null,
    };
  }

  // =====================================================
  // CALCULAR EDAD
  // =====================================================

  calcularEdad(): void {
    if (!this.formulario.fechaNacimiento) {
      this.formulario.edad = undefined;
      return;
    }

    const hoy = new Date();
    const nacimiento = new Date(this.formulario.fechaNacimiento + 'T00:00:00');

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    this.formulario.edad = edad >= 0 ? edad : 0;
  }


  // =====================================================
  // SELECCIONAR ARCHIVOS (DOCUMENTOS)
  // =====================================================

  onFileSelected(
    event: any,
    tipo: 'cedula' | 'tarjetaProfesional' | 'antecedentes' | 'hojaDeVida'
  ): void {
    const file = event.target.files[0];
    if (file) {
      if (tipo === 'cedula') {
        this.formulario.cedulaFile = file;
      } else if (tipo === 'tarjetaProfesional') {
        this.formulario.tarjetaProfesionalFile = file;
      } else if (tipo === 'antecedentes') {
        this.formulario.antecedentesFile = file;
      } else if (tipo === 'hojaDeVida') {
        this.formulario.hojaDeVidaFile = file;
      }
    }
  }


  // =====================================================
  // ABRIR MODAL
  // =====================================================

  openModal(
    modo: 'new' | 'editPrincipal' | 'edit',
    encargado?: Encargado
  ): void {

    this.modalAbierto = true;

    this.modoEdicion = modo !== 'new';

    this.editarPrincipal = modo === 'editPrincipal';

    this.idEditando = null;

    this.limpiarErrores();


    // NUEVO

    if (modo === 'new') {

      this.formulario = this.formularioInicial();

      return;
    }

    // EDITAR PRINCIPAL

    if ((modo as string) === 'editPrincipal') {
      if (!this.encargadoPrincipal) {
        this.closeModal();
        return;
      }

      this.formulario = {
        tipoDocumento: this.encargadoPrincipal.tipoDocumento || '',
        documento: this.encargadoPrincipal.documento,
        nombres: this.encargadoPrincipal.nombres,
        apellidos: this.encargadoPrincipal.apellidos,
        estado: this.encargadoPrincipal.estado,
        fechaIngreso: this.encargadoPrincipal.fechaIngreso,
        fechaNacimiento: this.encargadoPrincipal.fechaNacimiento || '',
        edad: this.encargadoPrincipal.edad,
        telefono: this.encargadoPrincipal.telefono,
        email: this.encargadoPrincipal.email,
        especialidad: this.encargadoPrincipal.especialidad || '',
        licencia: this.encargadoPrincipal.licencia || '',
        experiencia: this.encargadoPrincipal.experiencia || '',
        institucion: this.encargadoPrincipal.institucion || '',
        cedulaFile: null,
        tarjetaProfesionalFile: null,
        antecedentesFile: null,
        hojaDeVidaFile: null,
      };

      return;
    }

    // EDITAR OTRO

    if (modo === 'edit' && encargado) {

      this.idEditando = encargado.id;

      this.formulario = {
        tipoDocumento: encargado.tipoDocumento || '',
        documento: encargado.documento,
        nombres: encargado.nombres,
        apellidos: encargado.apellidos,
        estado: encargado.estado,
        fechaIngreso: encargado.fechaIngreso,
        fechaNacimiento: encargado.fechaNacimiento || '',
        edad: encargado.edad,
        telefono: encargado.telefono,
        email: encargado.email,
        especialidad: encargado.especialidad || '',
        licencia: encargado.licencia || '',
        experiencia: encargado.experiencia || '',
        institucion: encargado.institucion || '',
        cedulaFile: null,
        tarjetaProfesionalFile: null,
        antecedentesFile: null,
        hojaDeVidaFile: null,
      };
    }
  }

  // =====================================================
  // CONFIRMAR EDICIÓN
  // =====================================================

  confirmarEdicion(encargado: Encargado): void {

    alertaEditar(`${encargado.nombres} ${encargado.apellidos}`).then((resultado) => {

      if (resultado.isConfirmed) {
        this.openModal('edit', encargado);
        this.cdr.detectChanges();
      }
    });
  }
  
  // =====================================================
  // CERRAR MODAL
  // =====================================================

  closeModal(): void {

    if (this.guardando) {
      return;
    }

    this.modalAbierto = false;

    this.limpiarErrores();

    this.formulario = this.formularioInicial();

    this.modoEdicion = false;

    this.editarPrincipal = false;

    this.idEditando = null;
  }


  // =====================================================
  // VER DETALLES
  // =====================================================

  verDetalles(encargado: Encargado): void {

    this.encargadoSeleccionado = encargado;

    this.modalDetallesAbierto = true;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CERRAR DETALLES
  // =====================================================

  cerrarModalDetalles(): void {

    this.modalDetallesAbierto = false;

    this.encargadoSeleccionado = null;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CERRAR DETALLES POR FONDO
  // =====================================================

  cerrarModalDetallesPorFondo(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.cerrarModalDetalles();
    }
  }


  // =====================================================
  // CERRAR MODAL POR FONDO
  // =====================================================

  cerrarAlClickarFondo(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }


  // =====================================================
  // DOCUMENTO DUPLICADO
  // =====================================================

  DocumentoDuplicado(documento: string): boolean {

    const documentoLimpio = documento.trim();

    if (!documentoLimpio) {
      return false;
    }


    if (
      !this.editarPrincipal &&
      this.encargadoPrincipal &&
      this.encargadoPrincipal.documento === documentoLimpio
    ) {

      return true;
    }


    return this.encargados.some((encargado) => {

      if (
        this.idEditando !== null &&
        encargado.id === this.idEditando
      ) {

        return false;
      }

      return encargado.documento === documentoLimpio;
    });
  }


  // =====================================================
  // EMAIL VÁLIDO
  // =====================================================

  emailValido(email: string): boolean {

    const regexEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return regexEmail.test(email.trim());
  }


  // =====================================================
  // TELÉFONO VÁLIDO
  // =====================================================

  telefonoValido(telefono: string): boolean {

    return /^[0-9]{10}$/.test(telefono.trim());
  }


  // =====================================================
  // SOLO NÚMEROS
  // =====================================================

  soloNumerosTelefono(event: Event): void {

    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '');

    this.formulario.telefono = input.value;
  }


  // =====================================================
  // EMAIL DUPLICADO
  // =====================================================

  emailDuplicado(email: string): boolean {

    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio) {
      return false;
    }

    if (
      !this.editarPrincipal &&
      this.encargadoPrincipal &&
      this.encargadoPrincipal.email.toLowerCase() === emailLimpio
    ) {

      return true;
    }

    return this.encargados.some((encargado) => {

      if (
        this.idEditando !== null &&
        encargado.id === this.idEditando
      ) {

        return false;
      }

      return encargado.email.toLowerCase() === emailLimpio;
    });
  }


  // =====================================================
  // VALIDAR FORMULARIO
  // =====================================================

  validarFormulario(): boolean {

    this.limpiarErrores();

    let valido = true;

    if (!this.formulario.tipoDocumento) {
      this.errores.tipoDocumento = true;
      valido = false;
    }


    if (!this.formulario.documento.trim()) {

      this.errores.documento = true;

      valido = false;
    }


    if (!this.formulario.nombres.trim()) {

      this.errores.nombres = true;

      valido = false;
    }

     if (!this.formulario.apellidos.trim()) {

      this.errores.apellidos = true;

      valido = false;
    }

    const telefono = this.formulario.telefono.trim();

    if (!telefono || !this.telefonoValido(telefono)) {

      this.errores.telefono = true;

      valido = false;
    }


    const email = this.formulario.email.trim();

    if (!email) {

      this.errores.email = true;

      valido = false;

    } else if (!this.emailValido(email)) {

      this.errores.emailInvalido = true;

      valido = false;
    }

    return valido;
  }


  // =====================================================
  // LIMPIAR ERRORES
  // =====================================================

  limpiarErrores(): void {

    this.errores = {
      tipoDocumento: false,
      documento: false,
      nombres: false,
      apellidos: false,
      telefono: false,
      email: false,
      emailInvalido: false,
    };
  }


  // =====================================================
  // GUARDAR ENCARGADO
  // =====================================================
  saveEncargado(): void {

    if (this.guardando) {
      return;
    }

    if (!this.validarFormulario()) {

      let mensaje = 'Completa los campos obligatorios.';

      if (this.errores.telefono) {
        mensaje = 'El teléfono debe contener exactamente 10 números.';
      } else if (this.errores.emailInvalido) {
        mensaje = 'Ingresa un correo electrónico válido.';
      }


      /*
       * AQUÍ NO SE CREAN OBJETOS QUEMADOS.
       *
       * El formulario debe enviarse mediante EncargadosService
       * a la API de Django.
       *
       * Cuando me pases tu servicio/endpoints, esta parte
       * se conecta directamente con POST, PUT/PATCH.
       */
     alertaAdvertencia('Revisa el formulario', mensaje);
      return;
    }

    if (this.DocumentoDuplicado(this.formulario.documento)) {
      this.errores.documento = true;
    alertaAdvertencia('Documento duplicado', 'El número de documento ya se encuentra registrado.');
      return;
    }

    if (this.emailDuplicado(this.formulario.email)) {
      this.errores.email = true;
alertaAdvertencia('Correo duplicado', 'El correo electrónico ya se encuentra registrado.');
      return;
    }

    this.guardando = true;

    // Cuerpo que espera la API (nombres de campos del backend, no los tuyos)
    const cuerpo: any = {
      tipo_documento: this.formulario.tipoDocumento,
      numero_documento: this.formulario.documento,
      nombres: this.formulario.nombres,
      apellidos: this.formulario.apellidos,
      correo: this.formulario.email,
      telefono: this.formulario.telefono,
      fecha_ingreso: this.formulario.fechaIngreso,
      estado: this.formulario.estado === 'Activo',
      id_rol: 6,
    };

    if (this.modoEdicion && this.idEditando) {

      // ACTUALIZAR
      this.http.put(`${this.apiUrl}${this.idEditando}/`, cuerpo).subscribe({

        next: () => {
          this.guardando = false;
          alertaExito('Encargado actualizado', 'El encargado ha sido actualizado correctamente.');
          this.closeModal();
          this.cargarEncargados();
        },

        error: (err) => {
          this.guardando = false;
          console.error(err);
          alertaError('Error al cargar encargados', 'No se pudo conectar con el servidor.');
        },
      });

    } else {

      // CREAR
      this.http.post(this.apiUrl, cuerpo).subscribe({

        next: () => {
          this.guardando = false;
          alertaExito('Encargado creado');
          this.closeModal();
          this.cargarEncargados();
        },

        error: (err) => {
          this.guardando = false;
          console.error(err);
          alertaError('Error al crear', 'Revisa la consola del navegador para más detalles.');
        },
      });
    }
  }



  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  cambiarEstado(encargado: Encargado): void {

    const nuevoEstadoBooleano = encargado.estado !== 'Activo';

    const nuevoEstadoTexto = nuevoEstadoBooleano ? 'Activo' : 'Inactivo';


    const nombre = `${encargado.nombres} ${encargado.apellidos}`;

    const pregunta = nuevoEstadoBooleano
      ? alertaActivar(nombre)
      : alertaDesactivar(nombre);

    pregunta.then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.http
        .patch(`${this.apiUrl}${encargado.id}/`, { estado: nuevoEstadoBooleano })
        .subscribe({

          next: () => {

          alertaExito(nuevoEstadoTexto === 'Activo' ? 'Encargado activado' : 'Encargado desactivado');

            this.cargarEncargados();
          },

          error: (err: any) => {

            console.error(err);

          alertaError('Error al actualizar estado', 'No se pudo actualizar el estado del encargado.'); 
          },
        });
    });
  }


  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarEncargado(encargado: Encargado): void {

    alertaEliminar(`${encargado.nombres} ${encargado.apellidos}`).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.http.delete(`${this.apiUrl}${encargado.id}/`).subscribe({

        next: () => {
          alertaExito('Encargado eliminado');
          this.cargarEncargados();
        },

        error: () => {
          alertaError('Error al eliminar', 'No se pudo eliminar el encargado.');
        },
      });
    });
  }


  // =====================================================
  // GENERAR INICIALES
  // =====================================================

  generarIniciales(nombre: string): string {

    const partes =
      nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (partes.length === 0) {
      return 'NA';
    }


    if (partes.length === 1) {

      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      partes[0][0] +
      partes[partes.length - 1][0]
    ).toUpperCase();
  }

  // =====================================================
  // FILTRAR
  // =====================================================
  // =====================================================
  // ACTUALIZAR PAGINACIÓN
  // =====================================================

  actualizarPaginacion(): void {

    this.totalPaginas = Math.ceil(
      this.encargadosFiltrados.length /
      this.encargadosPorPagina
    );


    this.paginas = Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );


    const inicio =
      (this.paginaActual - 1) *
      this.encargadosPorPagina;


    const fin =
      inicio +
      this.encargadosPorPagina;


    this.encargadosPaginaActual =
      this.encargadosFiltrados.slice(
        inicio,
        fin
      );

  }


  // =====================================================
  // CAMBIAR PÁGINA
  // =====================================================

  cambiarPagina(pagina: number): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }
    this.paginaActual = pagina;

    this.actualizarPaginacion();

  }
  filtrarEncargados(): void {

    const termino =
      this.busqueda.trim().toLowerCase();


    if (!termino) {

      this.encargadosFiltrados =
        [...this.encargados];

      this.paginaActual = 1;

      this.actualizarPaginacion();

      this.cdr.detectChanges();

      return;
    }


    this.encargadosFiltrados =
      this.encargados.filter((encargado) => {

        return (

          encargado.documento
            .toLowerCase()
            .includes(termino)

          ||

          encargado.nombres
            .toLowerCase()
            .includes(termino)

          ||

          encargado.apellidos
            .toLowerCase()
            .includes(termino)

          ||

          encargado.email
            .toLowerCase()
            .includes(termino)

          ||

          encargado.telefono
            .toLowerCase()
            .includes(termino)
        );
      });


    this.cdr.detectChanges();
    this.paginaActual = 1;
    this.actualizarPaginacion();

  }

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  formatearFechaIngreso(fecha: string): string {

    if (!fecha) {
      return 'Fecha no registrada';
    }

    // La API puede devolver solo la fecha ("2026-09-08") o
    // una fecha y hora completa en ISO ("2026-09-08T17:45:03Z").
    // Si ya trae la "T", no le agregamos otra.
    const fechaObj =
      fecha.includes('T')
        ? new Date(fecha)
        : new Date(`${fecha}T00:00:00`);


    if (
      Number.isNaN(
        fechaObj.getTime()
      )
    ) {

      return 'Fecha no registrada';
    }


    const dia = String(fechaObj.getDate()).padStart(2, '0');

    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');

    const anio = fechaObj.getFullYear();
  

    return `${dia}/${mes}/${anio}`;
  }
}