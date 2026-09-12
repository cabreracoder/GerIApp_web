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

                    Swal.fire({
                      title: 'Error',
                      text: 'No se pudieron cargar los documentos de los cuidadores.',
                      icon: 'error',
                      confirmButtonColor: '#3B5BDB'
                    });

                  }

                });

            },

            error: error => {

              console.error(
                'Error cargando perfiles profesionales:',
                error
              );

              Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los perfiles profesionales.',
                icon: 'error',
                confirmButtonColor: '#3B5BDB'
              });

            }

          });

      },

      error: error => {

        console.error(
          'Error al obtener cuidadores:',
          error
        );

        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los cuidadores.',
          icon: 'error',
          confirmButtonColor: '#3B5BDB'
        });

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

    Swal.fire({
      title: 'Editar cuidador',
      text: `¿Deseas editar a ${cuidador.nombreCompleto || cuidador.nombre
        }?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB'
    }).then(resultado => {

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
      Swal.fire({
        title: 'Campos obligatorios',
        text: 'Por favor completa los campos obligatorios.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });
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
                Swal.fire({
                  title: 'Actualización parcial',
                  text: 'El usuario se actualizó, pero ocurrió un error al actualizar el perfil profesional.',
                  icon: 'warning',
                  confirmButtonColor: '#3B5BDB'
                });
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
                Swal.fire({
                  title: 'Actualización parcial',
                  text: 'El usuario se actualizó, pero no se pudo crear el perfil profesional.',
                  icon: 'warning',
                  confirmButtonColor: '#3B5BDB'
                });
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
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el cuidador.',
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
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
          Swal.fire({
            title: 'Advertencia',
            text: 'El usuario fue creado, pero no se pudo crear su perfil profesional.',
            icon: 'warning',
            confirmButtonColor: '#3B5BDB'
          });
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

                Swal.fire({
                  title: 'Cuidador registrado',
                  text: 'El cuidador fue registrado correctamente.',
                  icon: 'success',
                  confirmButtonColor: '#3B5BDB'
                });

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

                Swal.fire({
                  title: 'Cuidador creado',
                  text: 'El cuidador fue creado, pero ocurrió un error al registrar los documentos.',
                  icon: 'warning',
                  confirmButtonColor: '#3B5BDB'
                });

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

            Swal.fire({
              title: 'Cuidador creado',
              text: 'El cuidador fue creado, pero no se pudo crear su perfil profesional.',
              icon: 'warning',
              confirmButtonColor: '#3B5BDB'
            });

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
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el cuidador.',
          icon: 'error',
          confirmButtonColor: '#3B5BDB'
        });
      }
    });
  }


  private finalizarGuardadoEdicion(): void {

    this.guardando = false;
    this.cdr.detectChanges();

    Swal.fire({
      title: 'Cuidador actualizado',
      text: 'Cuidador actualizado correctamente.',
      icon: 'success',
      confirmButtonColor: '#3B5BDB'
    });

    this.cerrarFormulario();

    this.listar();
  }

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

  cambiarEstado(
    cuidador: ICuidador
  ): void {

    if (!cuidador.id) {
      return;
    }

    const nuevoEstado =
      cuidador.estado !== 'activo';

    Swal.fire({

      title:
        nuevoEstado
          ? 'Activar cuidador'
          : 'Desactivar cuidador',

      text:
        `¿Deseas ${nuevoEstado
          ? 'activar'
          : 'desactivar'
        } a ${cuidador.nombreCompleto || cuidador.nombre}?`,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText:
        nuevoEstado
          ? 'Sí, activar'
          : 'Sí, desactivar',

      cancelButtonText: 'Cancelar',

      confirmButtonColor: '#3B5BDB'

    }).then(resultado => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.http.patch(
        `${this.apiUrl}${cuidador.id}/`,
        {
          estado: nuevoEstado
        }
      ).subscribe({

        next: () => {

          cuidador.estado =
            nuevoEstado
              ? 'activo'
              : 'inactivo';

          cuidador.disponible =
            nuevoEstado;

          this.actualizarMetricas();

          this.filtrarCuidadores();

          this.cdr.detectChanges();

          Swal.fire({
            title: 'Estado actualizado',
            text:
              nuevoEstado
                ? 'El cuidador está activo.'
                : 'El cuidador está inactivo.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

        },

        error: error => {

          console.error(
            'Error cambiando estado:',
            error
          );

          Swal.fire({
            title: 'Error',
            text: 'No se pudo cambiar el estado.',
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });

        }

      });

    });

  }


  // =========================================================
  // ELIMINAR
  // =========================================================

  solicitarEliminacion(
    id?: number
  ): void {

    if (!id) {
      return;
    }

    this.idEliminando = id;

    this.confirmacionAbierta = true;

  }


  cerrarConfirmacion(): void {

    this.confirmacionAbierta = false;

    this.idEliminando = null;

  }


  confirmarEliminacion(): void {

    if (!this.idEliminando) {
      return;
    }

    this.http.delete(
      `${this.apiUrl}${this.idEliminando}/`
    ).subscribe({

      next: () => {

        this.cerrarConfirmacion();

        Swal.fire({
          title: 'Eliminado',
          text: 'El cuidador fue eliminado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3B5BDB'
        });

        this.listar();

      },

      error: error => {

        console.error(
          'Error eliminando cuidador:',
          error
        );

        this.cerrarConfirmacion();

        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el cuidador.',
          icon: 'error',
          confirmButtonColor: '#3B5BDB'
        });

      }

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
