import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// =========================================================
// INTERFACES
// =========================================================
export interface ICuidador {
  id?: number;
  id_usuario?: number;
  id_perfil_profesional?: number;
  id_documento?: number;

  nombre?: string;
  nombres?: string;

  apellido?: string;
  apellidos?: string;
  nombreCompleto?: string;

  correo?: string;

  tipoDocumento?: string;
  tipo_documento?: string;

  numeroDocumento?: string;
  numero_documento?: string;
  documento?: string;

  telefono?: string;
  fechaNacimiento?: string;
  edad?: number;

  especialidad?: string;
  licencia?: string;
  experiencia?: number;
  institucion?: string;

  turno?: string;
  pacientes?: number;

  estado?: 'activo' | 'inactivo' | boolean;
  disponible?: boolean;

  diasDisponibles?: string[];

  archivos?: {
    cedula?: string | null;
    tarjeta_profesional?: string | null;
    antecedentes?: string | null;
    hoja_de_vida?: string | null;
  };

  cedulaFile?: File;
  tarjetaProfesionalFile?: File;
  antecedentesFile?: File;
  hojaDeVidaFile?: File;

  fechaIngreso?: string;
  id_rol?: number;
}

interface IPerfilProfesional {
  id_perfil_profesional?: number;
  especialidad?: string;
  licencia?: string;
  experiencia?: number;
  institucion?: string;
  id_usuario?: number;
}

interface IDocumentos {
  id_documento?: number;
  cedula?: string | null;
  tarjeta_profesional?: string | null;
  antecedentes?: string | null;
  hoja_de_vida?: string | null;
  id_usuario?: number;
}

export interface ErroresFormulario {
  nombre?: boolean;
  apellido?: boolean;
  tipoDocumento?: boolean;
  numeroDocumento?: boolean;
  telefono?: boolean;
  correo?: boolean;
  especialidad?: boolean;
  licencia?: boolean;
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

// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector: 'app-cuidadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuidadores.html',
  styleUrl: './cuidadores.css'
})
export class Cuidadores implements OnInit {

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  private apiUrl =
    'https://geriapp-backend.onrender.com/api/usuarios/';

  private perfilUrl =
    'https://geriapp-backend.onrender.com/api/perfil_profesional/';

  private documentosUrl =
    'https://geriapp-backend.onrender.com/api/documentos/';

  // =========================================================
  // DATOS
  // =========================================================

  cuidadores: ICuidador[] = [];

  cuidadoresFiltrados: ICuidador[] = [];
  // =========================================================
  // PAGINACIÓN
  // =========================================================
  cuidadoresPaginaActual: ICuidador[] = [];
  cuidadoresPorPagina = 10;
  paginaActual = 1;

  totalPaginas = 1;

  paginas: number[] = [];
  textoBusqueda = '';

  ordenNombre: 'asc' | 'desc' = 'asc';


  // =========================================================
  // MÉTRICAS
  // =========================================================

  totalCuidadores = 0;

  cuidadoresActivos = 0;

  cuidadoresDisponibles = 0;


  // =========================================================
  // MODALES
  // =========================================================

  formularioAbierto = false;

  detalleAbierto = false;

  confirmacionAbierta = false;

  modoFormulario: 'crear' | 'editar' = 'crear';

  idEditando: number | null = null;

  idEliminando: number | null = null;

  cuidadorSeleccionado: ICuidador | null = null;

  guardando = false;


  // =========================================================
  // FORMULARIO
  // =========================================================

  formulario: ICuidador =
    this.formularioInicial();

  errores: ErroresFormulario = {};

  diasSeleccionados: string[] = [];

  archivosSubidos: {
    [clave: string]: File;
  } = {};


  tiposDocumento: string[] = [
    'CC',
    'CE',
    'TI',
    'PASAPORTE',
    'PEP'
  ];

  diasSemana: string[] = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ];


  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {
    this.listar();
  }


  // =========================================================
  // LISTAR CUIDADORES
  // =========================================================

  listar(): void {

    this.http.get<ICuidador[]>(this.apiUrl).subscribe({

      next: (usuarios) => {

        const cuidadores = usuarios.filter(
          usuario => usuario.id_rol === 5
        );

        this.http.get<IPerfilProfesional[]>(this.perfilUrl)
          .subscribe({

            next: (perfiles) => {

              this.http.get<IDocumentos[]>(this.documentosUrl)
                .subscribe({

                  next: (documentos) => {

                    this.cuidadores =
                      cuidadores.map(c => {

                        const id =
                          c.id_usuario || c.id;

                        const nombre =
                          c.nombres ||
                          c.nombre ||
                          '';

                        const apellido =
                          c.apellidos ||
                          c.apellido ||
                          '';

                        const nombreCompleto =
                          c.nombreCompleto ||
                          `${nombre} ${apellido}`.trim();

                        const numeroDocumento =
                          c.numero_documento ||
                          c.numeroDocumento ||
                          c.documento ||
                          '';

                        const tipoDocumento =
                          c.tipo_documento ||
                          c.tipoDocumento ||
                          'CC';

                        const activo =
                          c.estado === true ||
                          c.estado === 'activo';

                        const perfil =
                          perfiles.find(
                            p => p.id_usuario === id
                          );

                        const documentosUsuario =
                          documentos.find(
                            d => d.id_usuario === id
                          );

                        return {

                          ...c,

                          id,

                          nombre,

                          apellido,

                          nombreCompleto,

                          tipoDocumento,

                          numeroDocumento,

                          documento:
                            numeroDocumento,

                          estado:
                            activo
                              ? 'activo'
                              : 'inactivo',

                          disponible:
                            c.disponible ??
                            (
                              activo &&
                              (!c.pacientes ||
                                c.pacientes < 3)
                            ),

                          id_perfil_profesional:
                            perfil?.id_perfil_profesional,

                          especialidad:
                            perfil?.especialidad || '',

                          licencia:
                            perfil?.licencia || '',

                          experiencia:
                            perfil?.experiencia ?? 0,

                          institucion:
                            perfil?.institucion || '',

                          archivos: {

                            cedula:
                              documentosUsuario?.cedula || '',

                            tarjeta_profesional:
                              documentosUsuario?.tarjeta_profesional || '',

                            antecedentes:
                              documentosUsuario?.antecedentes || '',

                            hoja_de_vida:
                              documentosUsuario?.hoja_de_vida || ''

                          }

                        };

                      });

                    this.actualizarMetricas();

                    this.filtrarCuidadores();

                    this.cdr.detectChanges();

                  },

                  error: error => {

                    console.error('ERROR COMPLETO:', error);
                    console.error('STATUS:', error.status);
                    console.error('MENSAJE DEL BACKEND:', error.error);

                    alertaError('Error', 'No se pudieron cargar los documentos de los cuidadores.');

                  }

                });

            },

            error: error => {

              console.error(
                'Error cargando perfiles profesionales:',
                error
              );

             alertaError('Error', 'No se pudieron cargar los perfiles profesionales.');

            }

          });

      },

      error: error => {

        console.error(
          'Error al obtener cuidadores:',
          error
        );

       alertaError('Error', 'No se pudieron cargar los cuidadores.');

      }

    });

  }



  filtrarCuidadores(): void {

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();

    this.cuidadoresFiltrados =
      this.cuidadores.filter(c => {

        const nombre =
          (
            c.nombreCompleto ||
            `${c.nombre || ''} ${c.apellido || ''}`
          ).toLowerCase();

        const documento =
          (
            c.numeroDocumento ||
            c.documento ||
            ''
          ).toLowerCase();

        return (
          nombre.includes(texto) ||
          documento.includes(texto)
        );

      });

    this.aplicarOrdenamiento();
    this.paginaActual = 1;
    this.actualizarPaginacion();

  }

  // =========================================================
  // ACTUALIZAR PAGINACIÓN
  // =========================================================

  actualizarPaginacion(): void {

    this.totalPaginas = Math.ceil(
      this.cuidadoresFiltrados.length /
      this.cuidadoresPorPagina
    );


    this.paginas = Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );


    if (this.paginaActual > this.totalPaginas) {

      this.paginaActual =
        this.totalPaginas || 1;

    }


    const inicio =
      (this.paginaActual - 1) *
      this.cuidadoresPorPagina;


    const fin =
      inicio +
      this.cuidadoresPorPagina;


    this.cuidadoresPaginaActual =
      this.cuidadoresFiltrados.slice(
        inicio,
        fin
      );

  }


  // =========================================================
  // CAMBIAR PÁGINA
  // =========================================================

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
  // =========================================================
  // ORDENAR
  // =========================================================

  ordenarCuidadores(): void {

    this.ordenNombre =
      this.ordenNombre === 'asc'
        ? 'desc'
        : 'asc';

    this.aplicarOrdenamiento();

  }


  aplicarOrdenamiento(): void {

    this.cuidadoresFiltrados.sort((a, b) => {

      const nombreA =
        (
          a.nombreCompleto ||
          a.nombre ||
          ''
        ).toLowerCase();

      const nombreB =
        (
          b.nombreCompleto ||
          b.nombre ||
          ''
        ).toLowerCase();

      if (nombreA < nombreB) {
        return this.ordenNombre === 'asc'
          ? -1
          : 1;
      }

      if (nombreA > nombreB) {
        return this.ordenNombre === 'asc'
          ? 1
          : -1;
      }

      return 0;

    });
    this.actualizarPaginacion();
  }


  // =========================================================
  // MÉTRICAS
  // =========================================================

  actualizarMetricas(): void {

    this.totalCuidadores =
      this.cuidadores.length;

    this.cuidadoresActivos =
      this.cuidadores.filter(
        c => c.estado === 'activo'
      ).length;

    this.cuidadoresDisponibles =
      this.cuidadores.filter(
        c => c.disponible
      ).length;

  }


  // =========================================================
  // NUEVO
  // =========================================================

  nuevo(): void {

    this.modoFormulario = 'crear';

    this.idEditando = null;

    this.formulario =
      this.formularioInicial();

    this.diasSeleccionados = [];

    this.archivosSubidos = {};

    this.errores = {};

    this.formularioAbierto = true;

  }
  // =========================================================
  // CONFIRMAR EDICIÓN
  // =========================================================

  confirmarEdicion(cuidador: ICuidador): void {

  if (!cuidador.id) {
    return;
  }

  const nombre = cuidador.nombreCompleto || `${cuidador.nombre || ''} ${cuidador.apellido || ''}`.trim();

  alertaEditar(nombre, 'cuidador').then(resultado => {

    if (resultado.isConfirmed) {
      this.abrirFormulario('editar', cuidador.id);
    }

  });

}


  // =========================================================
  // EDITAR
  // =========================================================

  editarCuidador(id: number): void {

    const cuidador =
      this.cuidadores.find(
        c => c.id === id
      );

    if (!cuidador) {
      return;
    }

    this.modoFormulario = 'editar';

    this.idEditando = id;

    this.formulario = {

      ...cuidador,

      archivos: {

        cedula:
          cuidador.archivos?.cedula || '',

        tarjeta_profesional:
          cuidador.archivos?.tarjeta_profesional || '',

        antecedentes:
          cuidador.archivos?.antecedentes || '',

        hoja_de_vida:
          cuidador.archivos?.hoja_de_vida || ''

      }

    };

    this.diasSeleccionados =
      cuidador.diasDisponibles
        ? [...cuidador.diasDisponibles]
        : [];

    this.archivosSubidos = {};

    this.calcularEdad();

    this.errores = {};

    this.formularioAbierto = true;

    this.cdr.detectChanges();

  }


  // =========================================================
  // ABRIR FORMULARIO
  // =========================================================

  abrirFormulario(
    modo: 'crear' | 'editar',
    id?: number
  ): void {

    if (modo === 'crear') {

      this.nuevo();

      return;

    }

    if (id !== undefined) {

      this.editarCuidador(id);

    }

  }


  // =========================================================
  // GUARDAR
  // =========================================================

  guardarCuidador(): void {
    if (!this.validarFormulario()) {
      alertaAdvertencia('Campos obligatorios', 'Por favor completa los campos obligatorios.');
      return;
    }

    this.guardando = true;

    const cuidador = {
      tipo_documento: this.formulario.tipoDocumento,
      numero_documento: this.formulario.numeroDocumento,
      nombres: this.formulario.nombre,
      apellidos: this.formulario.apellido,
      correo: this.formulario.correo,
      telefono: this.formulario.telefono,
      fecha_ingreso: this.formulario.fechaIngreso,
      estado: this.formulario.estado === 'activo',
      id_rol: 5
    };

    // ============================
    // EDITAR
    // ============================
    if (this.modoFormulario === 'editar' && this.idEditando) {

      const idUsuario = this.idEditando;

      console.log('Actualizando usuario:', cuidador);

      // API USUARIOS
      this.http.patch<any>(
        `${this.apiUrl}${idUsuario}/`,
        cuidador
      ).subscribe({
        next: () => {

          const perfil = this.cuidadores.find(
            c => c.id === idUsuario
          );

          const perfilProfesional = {
            id_usuario: idUsuario,
            especialidad: this.formulario.especialidad || null,
            licencia: this.formulario.licencia || null,
            experiencia: this.formulario.experiencia ?? null,
            institucion: this.formulario.institucion || null
          };

          // API PERFIL PROFESIONAL
          if (perfil?.id_perfil_profesional) {

            this.http.patch(
              `${this.perfilUrl}${perfil.id_perfil_profesional}/`,
              perfilProfesional
            ).subscribe({
              next: () => {
                this.finalizarGuardadoEdicion();
              },
              error: (error) => {
                console.error(
                  'Error al actualizar perfil profesional:',
                  error
                );
                this.guardando = false;
                alertaAdvertencia('Actualización parcial', 'El usuario se actualizó, pero ocurrió un error al actualizar el perfil profesional.');
              }
            });

          } else {

            // Si no existe perfil, lo crea
            this.http.post(
              this.perfilUrl,
              perfilProfesional
            ).subscribe({
              next: () => {
                this.finalizarGuardadoEdicion();
              },
              error: (error) => {
                console.error(
                  'Error al crear perfil profesional:',
                  error
                );
                this.guardando = false;
                this.cdr.detectChanges();
                alertaAdvertencia('Actualización parcial', 'El usuario se actualizó, pero no se pudo crear el perfil profesional.');
              }
            });
          }
        },

        error: (error) => {
          console.error(
            'Error al actualizar usuario:',
            error
          );
          this.guardando = false;
          this.cdr.detectChanges();
          alertaError('Error al actualizar', 'No se pudo actualizar el cuidador.');
        }
      });

      return;
    }
    // ============================
    // CREAR
    // ============================

    console.log('Creando usuario:', cuidador);

    // API USUARIOS
    this.http.post<any>(
      this.apiUrl,
      cuidador
    ).subscribe({
      next: (respuestaUsuario) => {

        console.log('Usuario creado:', respuestaUsuario);

        const idUsuario = respuestaUsuario.id_usuario;

        if (!idUsuario) {
          console.error(
            'La API no devolvió el id_usuario',
            respuestaUsuario
          );

          this.guardando = false;
          this.cdr.detectChanges();
          alertaAdvertencia('Advertencia', 'El usuario fue creado, pero no se pudo crear su perfil profesional.');
          return;
        }

        const perfilProfesional = {
          id_usuario: idUsuario,
          especialidad: this.formulario.especialidad || null,
          licencia: this.formulario.licencia || null,
          experiencia: this.formulario.experiencia ?? null,
          institucion: this.formulario.institucion || null
        };

        console.log(
          'Creando perfil profesional:',
          perfilProfesional
        );

        // API PERFIL PROFESIONAL
        this.http.post<any>(
          this.perfilUrl,
          perfilProfesional
        ).subscribe({
          next: (respuestaPerfil) => {

            console.log(
              'Perfil profesional creado:',
              respuestaPerfil
            );

            const documentos = {
              cedula:
                this.formulario.cedulaFile?.name || null,

              tarjeta_profesional:
                this.formulario.tarjetaProfesionalFile?.name || null,

              antecedentes:
                this.formulario.antecedentesFile?.name || null,

              hoja_de_vida:
                this.formulario.hojaDeVidaFile?.name || null,

              id_usuario: idUsuario
            };

            console.log(
              'Creando documentos:',
              documentos
            );

            // API DOCUMENTOS
            this.http.post(
              this.documentosUrl,
              documentos
            ).subscribe({
              next: (respuestaDocumentos) => {

                console.log(
                  'Documentos registrados:',
                  respuestaDocumentos
                );

                this.guardando = false;
                this.cdr.detectChanges();

                alertaExito('Cuidador registrado', 'El cuidador fue registrado correctamente.');

                this.cerrarFormulario();
                this.listar();
              },

              error: (errorDocumentos) => {

                console.error(
                  'Error al registrar documentos:',
                  errorDocumentos
                );

                this.guardando = false;
                this.cdr.detectChanges();

                alertaAdvertencia('Cuidador creado', 'El cuidador fue creado, pero ocurrió un error al registrar los documentos.');

                this.cerrarFormulario();
                this.listar();
              }
            });
          },

          error: (errorPerfil) => {

            console.error(
              'Error al crear el perfil profesional:',
              errorPerfil
            );

            this.guardando = false;
            this.cdr.detectChanges();

            alertaAdvertencia('Cuidador creado', 'El cuidador fue creado, pero no se pudo crear su perfil profesional.');

            this.cerrarFormulario();
            this.listar();
          }
        });
      },

      error: (errorUsuario) => {

        console.error(
          'Error al crear el usuario:',
          errorUsuario
        );

        this.guardando = false;
        this.cdr.detectChanges();
        alertaError('Error al crear', 'No se pudo registrar el cuidador.');
      }
    });
  }


  private finalizarGuardadoEdicion(): void {

    this.guardando = false;
    this.cdr.detectChanges();

    alertaExito('Cuidador actualizado', 'Cuidador actualizado correctamente.');

    this.cerrarFormulario();

    this.listar();
  }

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

cambiarEstado(cuidador: ICuidador): void {

  if (!cuidador.id) {
    return;
  }

  const nuevoEstado = cuidador.estado !== 'activo';
  const nombre = cuidador.nombreCompleto || `${cuidador.nombre || ''} ${cuidador.apellido || ''}`.trim();

  const pregunta = nuevoEstado
    ? alertaActivar(nombre, 'cuidador')
    : alertaDesactivar(nombre, 'cuidador');

  pregunta.then(resultado => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http.patch(`${this.apiUrl}${cuidador.id}/`, { estado: nuevoEstado }).subscribe({

      next: () => {
        cuidador.estado = nuevoEstado ? 'activo' : 'inactivo';
        cuidador.disponible = nuevoEstado;

        this.actualizarMetricas();
        this.filtrarCuidadores();
        this.cdr.detectChanges();

        alertaExito(nuevoEstado ? 'Cuidador activado' : 'Cuidador desactivado');
      },

      error: error => {
        console.error('Error cambiando estado:', error);
        alertaError('Error al actualizar estado', 'No se pudo cambiar el estado del cuidador.');
      }

    });

  });

}


  // =========================================================
  // ELIMINAR
  // =========================================================

solicitarEliminacion(cuidador: ICuidador): void {

  if (!cuidador.id) {
    return;
  }

  const nombre = cuidador.nombreCompleto || `${cuidador.nombre || ''} ${cuidador.apellido || ''}`.trim();

  alertaEliminar(nombre, 'cuidador').then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http.delete(`${this.apiUrl}${cuidador.id}/`).subscribe({

      next: () => {
        alertaExito('Cuidador eliminado');
        this.listar();
      },

      error: error => {
        console.error('Error eliminando cuidador:', error);
        alertaError('Error al eliminar', 'No se pudo eliminar el cuidador.');
      }

    });

  });

}

  // =========================================================
  // VER DETALLE
  // =========================================================

  verDetalle(
    cuidador: ICuidador
  ): void {

    this.cuidadorSeleccionado =
      cuidador;

    this.detalleAbierto = true;

  }


  cerrarDetalle(): void {

    this.detalleAbierto = false;

    this.cuidadorSeleccionado = null;

  }


  cerrarDetallePorOverlay(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.cerrarDetalle();

    }

  }


  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  cerrarFormulario(): void {

    if (this.guardando) {
      return;
    }

    this.formularioAbierto = false;

    this.formulario =
      this.formularioInicial();

    this.idEditando = null;

    this.errores = {};

    this.diasSeleccionados = [];

    this.archivosSubidos = {};

  }


  cancelarFormulario(): void {
    this.cerrarFormulario();
  }


  cerrarFormularioPorOverlay(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.cerrarFormulario();

    }

  }


  // =========================================================
  // VALIDACIÓN
  // =========================================================

  tieneError(
    campo: keyof ErroresFormulario
  ): boolean {

    return !!this.errores[campo];

  }


  validarFormulario(): boolean {

    this.errores = {};

    let valido = true;


    if (!this.formulario.nombre?.trim()) {
      this.errores.nombre = true;
      valido = false;
    }

    if (!this.formulario.apellido?.trim()) {
      this.errores.apellido = true;
      valido = false;
    }

    if (!this.formulario.tipoDocumento?.trim()) {
      this.errores.tipoDocumento = true;
      valido = false;
    }

    if (!this.formulario.numeroDocumento?.trim()) {
      this.errores.numeroDocumento = true;
      valido = false;
    }

    if (!this.formulario.telefono?.trim()) {
      this.errores.telefono = true;
      valido = false;
    }

    if (!this.formulario.correo?.trim()) {
      this.errores.correo = true;
      valido = false;
    }

    if (!this.formulario.especialidad?.trim()) {
      this.errores.especialidad = true;
      valido = false;
    }

    if (!this.formulario.licencia?.trim()) {
      this.errores.licencia = true;
      valido = false;
    }

    return valido;

  }


  // =========================================================
  // CALCULAR EDAD
  // =========================================================

  calcularEdad(): void {

    if (!this.formulario.fechaNacimiento) {

      this.formulario.edad =
        undefined;

      return;

    }

    const nacimiento =
      new Date(
        this.formulario.fechaNacimiento
      );

    const hoy =
      new Date();

    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear();

    const mes =
      hoy.getMonth() -
      nacimiento.getMonth();

    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() < nacimiento.getDate()
      )
    ) {

      edad--;

    }

    this.formulario.edad =
      edad >= 0
        ? edad
        : 0;

  }


  // =========================================================
  // DÍAS
  // =========================================================

  estaSeleccionadoElDia(
    dia: string
  ): boolean {

    return this.diasSeleccionados.includes(dia);

  }


  cambiarDia(
    dia: string
  ): void {

    if (this.estaSeleccionadoElDia(dia)) {

      this.diasSeleccionados =
        this.diasSeleccionados.filter(
          d => d !== dia
        );

    } else {

      this.diasSeleccionados.push(dia);

    }

  }


  // =========================================================
  // ARCHIVOS
  // =========================================================

  onFileSelected(
    event: Event,
    tipo: string
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      input.files &&
      input.files.length > 0
    ) {

      const archivo =
        input.files[0];

      this.archivosSubidos[tipo] =
        archivo;

      if (tipo === 'cedula') {
        this.formulario.cedulaFile = archivo;
      }

      if (tipo === 'tarjetaProfesional') {
        this.formulario.tarjetaProfesionalFile = archivo;
      }

      if (tipo === 'antecedentes') {
        this.formulario.antecedentesFile = archivo;
      }

      if (tipo === 'hojaDeVida') {
        this.formulario.hojaDeVidaFile = archivo;
      }

    }

  }


  seleccionarArchivo(
    event: Event,
    tipo: string
  ): void {

    this.onFileSelected(
      event,
      tipo
    );

  }


  archivoSeleccionado(
    tipo: string
  ): boolean {

    return !!this.archivosSubidos[tipo];

  }


  obtenerNombreArchivo(
    tipo: string
  ): string {

    return (
      this.archivosSubidos[tipo]?.name ||
      ''
    );

  }


  // =========================================================
  // FORMULARIO VACÍO
  // =========================================================

  formularioInicial(): ICuidador {

    return {

      nombre: '',
      apellido: '',
      tipoDocumento: 'CC',
      numeroDocumento: '',
      documento: '',
      telefono: '',
      correo: '',
      fechaNacimiento: '',
      edad: undefined,

      especialidad: '',
      licencia: '',
      experiencia: undefined,
      institucion: '',

      turno: '',
      pacientes: 0,

      estado: 'activo',
      disponible: true,

      fechaIngreso: '',

      cedulaFile: undefined,
      tarjetaProfesionalFile: undefined,
      antecedentesFile: undefined,
      hojaDeVidaFile: undefined

    };

  }


  // =========================================================
  // GET EDITAR
  // =========================================================

  get editar(): boolean {
    return this.idEditando !== null;
  }


  // =========================================================
  // AYUDAS VISUALES
  // =========================================================

  obtenerIniciales(
    nombre?: string
  ): string {

    if (!nombre) {
      return 'CU';
    }

    const partes =
      nombre.trim().split(' ');

    if (partes.length >= 2) {

      return (
        partes[0][0] +
        partes[1][0]
      ).toUpperCase();

    }

    return nombre
      .substring(0, 2)
      .toUpperCase();

  }


  obtenerColorAvatar(
    id?: number
  ): string {

    const colores = [
      '#3B5BDB',
      '#12B886',
      '#7950F2',
      '#FA8C16',
      '#E83E8C',
      '#228BE6'
    ];

    return colores[
      (id || 0) % colores.length
    ];

  }

}
