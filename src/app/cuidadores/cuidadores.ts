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



  foto?: string | null;

  fotoFile?: File | null;



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



// =========================================================
// ALERTAS GERIAPP - SWEETALERT2
// Diseño institucional unificado para todas las operaciones
// =========================================================

type TonoAlerta = 'azul' | 'verde' | 'rojo';

function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function contenidoAlerta(titulo: string, mensaje: string, mostrarCheck = false): string {
  return `
    <div class="geri-alerta">
      <div class="geri-alerta__onda"></div>
      <div class="geri-alerta__contenido">
        <img src="/Logo-GerIApp.png" class="geri-alerta__logo" alt="GeriApp"
             onerror="this.style.display='none'">
        ${mostrarCheck ? '<div class="geri-alerta__check">✓</div>' : ''}
        <h2 class="geri-alerta__titulo">${escaparHtml(titulo)}</h2>
        <p class="geri-alerta__mensaje">${escaparHtml(mensaje)}</p>
      </div>
    </div>
  `;
}

function mostrarAlerta(config: {
  titulo: string;
  mensaje: string;
  tono: TonoAlerta;
  confirmar: string;
  cancelar?: string;
  mostrarCheck?: boolean;
}) {
  return Swal.fire({
    html: contenidoAlerta(config.titulo, config.mensaje, config.mostrarCheck),
    width: 520,
    padding: 0,
    showCancelButton: !!config.cancelar,
    showConfirmButton: true,
    confirmButtonText: config.confirmar,
    cancelButtonText: config.cancelar || 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    heightAuto: false,
    scrollbarPadding: false,
    backdrop: 'rgba(33, 37, 41, 0.48)',
    customClass: {
      popup: 'geri-swal-popup',
      htmlContainer: 'geri-swal-html',
      actions: 'geri-swal-actions',
      confirmButton: `geri-swal-btn geri-swal-btn--${config.tono}`,
      cancelButton: 'geri-swal-btn geri-swal-btn--cancelar'
    }
  });
}

// CONFIRMACIONES
function alertaEliminar(nombre: string, _entidad = 'cuidador') {
  return mostrarAlerta({
    titulo: `¿Eliminar a ${nombre}?`,
    mensaje: 'Esta acción no se puede deshacer.',
    tono: 'rojo', confirmar: 'Eliminar', cancelar: 'Cancelar'
  });
}

function alertaEditar(nombre: string, _entidad = 'cuidador') {
  return mostrarAlerta({
    titulo: `¿Editar a ${nombre}?`,
    mensaje: 'Se abrirá el formulario para modificar su información.',
    tono: 'azul', confirmar: 'Continuar', cancelar: 'Cancelar'
  });
}

function alertaDesactivar(nombre: string, _entidad = 'cuidador') {
  return mostrarAlerta({
    titulo: `¿Desactivar a ${nombre}?`,
    mensaje: 'Podrás volver a activar este cuidador cuando lo necesites.',
    tono: 'rojo', confirmar: 'Sí, desactivar', cancelar: 'Cancelar'
  });
}

function alertaActivar(nombre: string, _entidad = 'cuidador') {
  return mostrarAlerta({
    titulo: `¿Activar a ${nombre}?`,
    mensaje: 'El cuidador volverá a estar activo en el sistema.',
    tono: 'azul', confirmar: 'Sí, activar', cancelar: 'Cancelar'
  });
}

// RESPUESTAS DEL SISTEMA
function alertaExito(titulo: string, mensaje = 'El registro se actualizó correctamente.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'verde', confirmar: 'Aceptar', mostrarCheck: true
  });
}

function alertaError(titulo: string, mensaje = 'Ocurrió un error al realizar la operación.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'rojo', confirmar: 'Aceptar'
  });
}

function alertaAdvertencia(titulo: string, mensaje = 'Revisa la información e inténtalo nuevamente.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'azul', confirmar: 'Aceptar'
  });
}

// =========================================================
// FIN ALERTAS GERIAPP
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

    'https\://geriapp-backend.onrender.com/api/usuarios/';



  private perfilUrl =

    'https\://geriapp-backend.onrender.com/api/perfil_profesional/';



  private documentosUrl =

    'https\://geriapp-backend.onrender.com/api/documentos/';



  private crearCuidadorUrl = `${this.apiUrl}crear-usuario-sede/`;

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



  fotoPreview: string | null = null;

  nombreFoto: string | null = null;

  eliminarFotoPendiente = false;

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

        console.log('Usuarios recibidos de la API:', usuarios);



        const cuidadores = usuarios.filter(

          usuario => usuario.id_rol === 3

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



                        const foto =

                          c.foto || null;



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



                          foto,



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



                          id_documento:

                            documentosUsuario?.id_documento,

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



    this.formulario = this.formularioInicial();

    this.fotoPreview = null;

    this.nombreFoto = null;

    this.eliminarFotoPendiente = false;

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

    this.formulario.foto = cuidador.foto || null;

    this.formulario.fotoFile = null;

    this.eliminarFotoPendiente = false;

    this.fotoPreview = this.formulario.foto;

    // Mostrar el nombre de la foto que ya está guardada.

    this.nombreFoto = this.obtenerNombreFoto(this.formulario.foto);

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

      especialidad: this.formulario.especialidad,

      licencia: this.formulario.licencia,

      experiencia: this.formulario.experiencia,

      institucion: this.formulario.institucion,

      id_rol: 3

    };

    const datosCuidador = new FormData();



    // Agregar los datos del cuidador.

    Object.entries(cuidador).forEach(([clave, valor]) => {

      if (valor !== undefined && valor !== null) {

        datosCuidador.append(clave, String(valor));

      }

    });



    // Agregar fotografía nueva, si existe.

    if (this.formulario.fotoFile) {

      datosCuidador.append('foto', this.formulario.fotoFile);

    }



    // ============================

    // EDITAR

    // ============================



    if (this.modoFormulario === 'editar' && this.idEditando) {



      const idUsuario = this.idEditando;

      // Datos personales permitidos por UsuariosViewSet.

      const datosUsuarioEditar = new FormData();

      datosUsuarioEditar.append(

        'tipo_documento',

        this.formulario.tipoDocumento ?? ''

      );



      datosUsuarioEditar.append(

        'numero_documento',

        this.formulario.numeroDocumento ?? ''

      );



      datosUsuarioEditar.append(

        'nombres',

        this.formulario.nombre ?? ''

      );



      datosUsuarioEditar.append(

        'apellidos',

        this.formulario.apellido ?? ''

      );



      datosUsuarioEditar.append(

        'correo',

        this.formulario.correo ?? ''

      );



      datosUsuarioEditar.append(

        'telefono',

        this.formulario.telefono ?? ''

      );

      datosUsuarioEditar.append(

        'estado',

        String(this.formulario.estado === 'activo')

      );



      datosUsuarioEditar.append('id_rol', '3');



      // Enviar fotografía solamente si se seleccionó una nueva.

      if (this.formulario.fotoFile) {

        datosUsuarioEditar.append(

          'foto',

          this.formulario.fotoFile

        );

      }

      console.log('Actualizando usuario:', cuidador);



      this.http.patch<any>(

        `${this.apiUrl}${idUsuario}/`,

        datosUsuarioEditar

      ).subscribe({



        next: () => {



          // Continuar con el perfil profesional y los documentos

          const continuarActualizacion = () => {



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



            if (perfil?.id_perfil_profesional) {



              this.http.patch(

                `${this.perfilUrl}${perfil.id_perfil_profesional}/`,

                perfilProfesional

              ).subscribe({



                next: () => {

                  this.guardarDocumentos(idUsuario, () => {

                    this.finalizarGuardadoEdicion();

                  });

                },



                error: (error) => {

                  console.error('Error al actualizar perfil profesional:', error);



                  this.guardando = false;

                  this.cdr.detectChanges();



                  alertaAdvertencia(

                    'Actualización parcial',

                    'El usuario se actualizó, pero ocurrió un error al actualizar el perfil profesional.'

                  );

                }



              });



            } else {



              this.http.post(

                this.perfilUrl,

                perfilProfesional

              ).subscribe({



                next: () => {

                  this.guardarDocumentos(idUsuario, () => {

                    this.finalizarGuardadoEdicion();

                  });

                },



                error: (error) => {

                  console.error('Error al crear perfil profesional:', error);



                  this.guardando = false;

                  this.cdr.detectChanges();



                  alertaAdvertencia(

                    'Actualización parcial',

                    'El usuario se actualizó, pero no se pudo crear el perfil profesional.'

                  );

                }



              });



            }

          };



          // Eliminar fotografía solamente si está pendiente

          // y no se ha seleccionado una fotografía nueva.

          if (

            this.eliminarFotoPendiente &&

            !this.formulario.fotoFile

          ) {



            this.http.delete(

              `${this.apiUrl}${idUsuario}/foto/`

            ).subscribe({



              next: () => {

                console.log('Foto eliminada correctamente.');



                this.eliminarFotoPendiente = false;

                continuarActualizacion();

              },



              error: (error) => {

                console.error('Error eliminando fotografía:', error);



                this.guardando = false;

                this.cdr.detectChanges();



                alertaError(

                  'Error al eliminar la foto',

                  'Los datos se actualizaron, pero no se pudo eliminar la fotografía.'

                );

              }



            });



          } else {



            this.eliminarFotoPendiente = false;

            continuarActualizacion();



          }



        },



        error: (error) => {

          console.error('Error al actualizar usuario:', error);



          this.guardando = false;

          this.cdr.detectChanges();



          alertaError(

            'Error al actualizar',

            'No se pudo actualizar el cuidador.'

          );

        }



      });



      return;

    }

    // ============================

    // CREAR CUIDADOR

    // ============================



    console.log('Creando cuidador:', cuidador);



    this.http.post<any>(

      this.crearCuidadorUrl,

      datosCuidador

    ).subscribe({



      next: (respuesta) => {



        console.log('Cuidador creado correctamente:', respuesta);



        // El backend devuelve el usuario y su perfil profesional.

        const usuario = respuesta.usuario;



        const idUsuario = usuario.id_usuario || usuario.id;



        if (!idUsuario) {



          console.error('No se recibió el ID del usuario:', respuesta);



          this.guardando = false;

          this.cdr.detectChanges();



          alertaAdvertencia(

            'Registro incompleto',

            'El cuidador fue creado, pero no se recibió su identificador.'

          );



          return;

        }



        // Guardar los documentos seleccionados.

        this.guardarDocumentos(idUsuario, () => {



          this.guardando = false;

          this.cdr.detectChanges();



          alertaExito(

            'Cuidador registrado',

            'El cuidador y su perfil profesional fueron registrados correctamente.'

          );



          this.cerrarFormulario();

          this.listar();



        });



      },



      error: (error) => {



        console.error('Error al crear cuidador:', error);

        console.error('Respuesta del backend:', error.error);



        this.guardando = false;

        this.cdr.detectChanges();



        const mensaje =

          error.error?.error ||

          error.error?.detail ||

          'No se pudo registrar el cuidador.';



        alertaError('Error al crear cuidador', mensaje);



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



          alertaExito(
            nuevoEstado ? `${nombre} fue activado` : `${nombre} fue desactivado`,
            nuevoEstado
              ? 'El cuidador quedó activo correctamente.'
              : 'El cuidador quedó inactivo correctamente.'
          );

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

          alertaExito(

            `${nombre} fue eliminado`,

            'El registro se eliminó correctamente.'

          ); this.listar();

        },



        error: error => {

          console.error('Error eliminando cuidador:', error);



          const mensajeBackend = JSON.stringify(error.error ?? {})

            .toLowerCase();



          const tieneAsignaciones =

            mensajeBackend.includes('asignacion') ||

            mensajeBackend.includes('asignación') ||

            mensajeBackend.includes('paciente') ||

            mensajeBackend.includes('foreign key') ||

            mensajeBackend.includes('protected');



          if (tieneAsignaciones) {

            alertaAdvertencia(

              'No se puede eliminar',

              'No se puede eliminar el cuidador porque tiene asignaciones registradas.'

            );

          } else {

            alertaError(

              'Error al eliminar',

              'No se pudo eliminar el cuidador. Inténtalo nuevamente más tarde.'

            );

          }

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



    this.fotoPreview = null;

    this.nombreFoto = null;

    this.eliminarFotoPendiente = false;

    this.idEditando = null;



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



  obtenerNombreFoto(url: string | null | undefined): string | null {

    if (!url) {

      return null;

    }



    try {

      const ruta = new URL(url, window.location.origin);

      const nombre = ruta.pathname.split('/').pop();



      return nombre ? decodeURIComponent(nombre) : 'Foto de perfil';

    } catch {

      return 'Foto de perfil';

    }

  }



  // =========================================================

  // FOTO DE PERFIL

  // =========================================================



  seleccionarFoto(event: Event): void {

    const input = event.target as HTMLInputElement;

    const archivo = input.files?.[0];



    if (!archivo) {

      return;

    }



    if (!archivo.type.startsWith('image/')) {

      alertaAdvertencia(

        'Archivo no válido',

        'Selecciona un archivo de imagen.'

      );

      input.value = '';

      return;

    }



    this.formulario.fotoFile = archivo;

    this.nombreFoto = archivo.name;

    this.eliminarFotoPendiente = false;

    const lector = new FileReader();



    lector.onload = () => {

      this.fotoPreview = lector.result as string;

      this.cdr.detectChanges();

    };



    lector.readAsDataURL(archivo);

  }

  confirmarEliminarFoto(): void {

    if (!this.fotoPreview) return;

    mostrarAlerta({
      titulo: '¿Eliminar foto de perfil?',
      mensaje: 'La fotografía desaparecerá del formulario. Los cambios se aplicarán al guardar.',
      tono: 'rojo',
      confirmar: 'Sí, eliminar',
      cancelar: 'Cancelar'
    }).then(resultado => {

      if (!resultado.isConfirmed) {
        return;
      }

      if (this.modoFormulario === 'crear') {
        this.formulario.foto = null;
        this.formulario.fotoFile = null;
        this.eliminarFotoPendiente = false;
      } else {
        this.formulario.foto = null;
        this.formulario.fotoFile = null;
        this.eliminarFotoPendiente = true;
      }

      this.fotoPreview = null;
      this.nombreFoto = null;
      this.cdr.detectChanges();
    });
  }


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



  private guardarDocumentos(

    idUsuario: number,

    finalizar: () => void

  ): void {



    const documentos = new FormData();

    documentos.append('id_usuario', String(idUsuario));



    // Solo enviar los documentos nuevos que el usuario seleccionó.

    if (this.formulario.cedulaFile) {

      documentos.append('cedula', this.formulario.cedulaFile);

    }



    if (this.formulario.tarjetaProfesionalFile) {

      documentos.append(

        'tarjeta_profesional',

        this.formulario.tarjetaProfesionalFile

      );

    }



    if (this.formulario.antecedentesFile) {

      documentos.append(

        'antecedentes',

        this.formulario.antecedentesFile

      );

    }



    if (this.formulario.hojaDeVidaFile) {

      documentos.append(

        'hoja_de_vida',

        this.formulario.hojaDeVidaFile

      );

    }



    const hayArchivos = !!(

      this.formulario.cedulaFile ||

      this.formulario.tarjetaProfesionalFile ||

      this.formulario.antecedentesFile ||

      this.formulario.hojaDeVidaFile

    );



    // Si no hay archivos nuevos, conservar los existentes.

    if (!hayArchivos) {

      finalizar();

      return;

    }



    // Si ya existe el registro, actualizarlo.

    // Si no existe, crear uno nuevo.

    const idDocumento = this.formulario.id_documento;



    const peticion = idDocumento

      ? this.http.patch(

        `${this.documentosUrl}${idDocumento}/`,

        documentos

      )

      : this.http.post(

        this.documentosUrl,

        documentos

      );



    peticion.subscribe({

      next: () => {

        finalizar();

      },



      error: (error) => {

        console.error(

          'Error al guardar los documentos:',

          error

        );



        console.error(

          'Respuesta del backend:',

          error.error

        );



        this.guardando = false;

        this.cdr.detectChanges();



        alertaError(

          'Error con los documentos',

          'No se pudieron guardar los documentos. Revisa la respuesta del servidor.'

        );

      }

    });

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

  descargarDocumento(url: string | null | undefined): string {



    if (!url) {

      return '';

    }



    if (url.includes('res.cloudinary.com')) {



      // Evitar agregar dos veces la opción de descarga

      if (url.includes('/fl_attachment/')) {

        return url;

      }



      // Funciona para imágenes y documentos RAW

      return url.replace(

        /\/(?:image|raw)\/upload\//,

        '$1fl_attachment/'

      );

    }



    return url;

  }

  // =========================================================

  // FORMULARIO VACÍO

  // =========================================================



  formularioInicial(): ICuidador {



    return {



      nombre: '',

      apellido: '',

      foto: null,

      fotoFile: null,

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
