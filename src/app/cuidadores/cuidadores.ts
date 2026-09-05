import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

export interface ITurno {
  nombre: string;
  horario: string;
}

export interface ICuidador {
  id?: number;
  id_usuario?: number;

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
    [clave: string]: File | string;
  };

  // Documentos
  cedulaFile?: File;
  tarjetaProfesionalFile?: File;
  antecedentesFile?: File;
  hojaDeVidaFile?: File;

  // Fecha de ingreso
  fechaIngreso?: string;

  id_rol?: number | any;
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


@Component({
  selector: 'app-cuidadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuidadores.html',
  styleUrl: './cuidadores.css',
})
export class Cuidadores implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);

  // Endpoint de Render
  private apiUrl =
    'https://geriapp-web-1.onrender.com/api/usuarios/';


  // ==========================================
  // DATOS
  // ==========================================

  cuidadores: ICuidador[] = [];

  cuidadoresFiltrados: ICuidador[] = [];


  // ==========================================
  // BÚSQUEDA Y ORDEN
  // ==========================================

  textoBusqueda = '';

  ordenNombre: 'asc' | 'desc' = 'asc';


  // ==========================================
  // MÉTRICAS
  // ==========================================

  totalCuidadores = 0;

  cuidadoresActivos = 0;

  cuidadoresDisponibles = 0;


  // ==========================================
  // MODALES
  // ==========================================

  formularioAbierto = false;

  detalleAbierto = false;

  confirmacionAbierta = false;


  modoFormulario: 'crear' | 'editar' = 'crear';

  idEditando: number | null = null;

  idEliminando: number | null = null;


  cuidadorSeleccionado: ICuidador | null = null;

  guardando = false;


  // ==========================================
  // DATOS DEL FORMULARIO
  // ==========================================

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


  diasSeleccionados: string[] = [];


  archivosSubidos: {
    [clave: string]: File
  } = {};


  formulario: ICuidador =
    this.formularioInicial();


  errores: ErroresFormulario = {};


  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {

    this.cargarCuidadores();

  }


  // ==========================================
  // CARGAR CUIDADORES
  // ==========================================
  cargarCuidadores() {

    this.http
      .get<any[]>(
        'https://geriapp-web-1.onrender.com/api/usuarios/'
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Respuesta de la API:',
            respuesta
          );

          this.cuidadores = respuesta
            .filter(usuario => usuario.id_rol === 5)
            .map(usuario => {

              return {
                id: usuario.id_usuario,
                nombre: usuario.nombres,
                apellido: usuario.apellidos,

                nombreCompleto:
                  usuario.nombres +
                  ' ' +
                  usuario.apellidos,

                correo: usuario.correo,

                telefono: usuario.telefono,

                tipoDocumento:
                  usuario.tipo_documento,

                numeroDocumento:
                  usuario.numero_documento,

                estado:
                  usuario.estado
                    ? 'activo'
                    : 'inactivo',

                id_rol:
                  usuario.id_rol,

                pacientes: 0,

                turno: 'Sin asignar'
              };

            });

          this.cuidadoresFiltrados =
            [...this.cuidadores];

          this.actualizarMetricas();

          console.log(
            'Cuidadores encontrados:',
            this.cuidadores
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar:',
            error
          );

        }

      });

  }


  // ==========================================
  // MÉTRICAS
  // ==========================================

  actualizarMetricas(): void {

    this.totalCuidadores =
      this.cuidadores.length;


    this.cuidadoresActivos =
      this.cuidadores.filter(
        (c) => c.estado === 'activo'
      ).length;


    this.cuidadoresDisponibles =
      this.cuidadores.filter(
        (c) => c.disponible
      ).length;

  }


  // ==========================================
  // BÚSQUEDA
  // ==========================================

  buscarCuidadores(): void {

    this.filtrarCuidadores();

  }


  filtrarCuidadores(): void {

    const busqueda =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    this.cuidadoresFiltrados =
      this.cuidadores.filter((c) => {

        const doc =
          (
            c.numeroDocumento ||
            c.documento ||
            ''
          )
            .toLowerCase();


        const nombre =
          (
            c.nombreCompleto ||
            `${c.nombre || ''} ${c.apellido || ''}`
          )
            .toLowerCase();


        return (
          doc.includes(busqueda) ||
          nombre.includes(busqueda)
        );

      });


    this.aplicarOrdenamiento();

    this.cdr.detectChanges();

  }


  // ==========================================
  // ORDENAMIENTO
  // ==========================================

  ordenarCuidadores(): void {

    this.ordenNombre =
      this.ordenNombre === 'asc'
        ? 'desc'
        : 'asc';


    this.aplicarOrdenamiento();

    this.cdr.detectChanges();

  }


  aplicarOrdenamiento(): void {

    this.cuidadoresFiltrados.sort(
      (a, b) => {

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

      }
    );

  }


  // ==========================================
  // CÁLCULO DE EDAD
  // ==========================================

  calcularEdad(): void {

    if (!this.formulario.fechaNacimiento) {

      this.formulario.edad =
        undefined;

      return;

    }


    const fechaNac =
      new Date(
        this.formulario.fechaNacimiento
      );


    const hoy =
      new Date();


    let edad =
      hoy.getFullYear() -
      fechaNac.getFullYear();


    const mes =
      hoy.getMonth() -
      fechaNac.getMonth();


    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() < fechaNac.getDate()
      )
    ) {

      edad--;

    }


    this.formulario.edad =
      edad >= 0
        ? edad
        : 0;

  }


  // ==========================================
  // FORMULARIO INICIAL
  // ==========================================

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

      hojaDeVidaFile: undefined,

    };

  }


  // ==========================================
  // DÍAS
  // ==========================================

  estaSeleccionadoElDia(
    dia: string
  ): boolean {

    return this.diasSeleccionados
      .includes(dia);

  }


  cambiarDia(
    dia: string
  ): void {

    if (
      this.estaSeleccionadoElDia(dia)
    ) {

      this.diasSeleccionados =
        this.diasSeleccionados.filter(
          (d) => d !== dia
        );

    } else {

      this.diasSeleccionados.push(dia);

    }

  }


  // ==========================================
  // ARCHIVOS
  // ==========================================

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

        this.formulario.cedulaFile =
          archivo;

      }


      if (
        tipo === 'tarjetaProfesional'
      ) {

        this.formulario.tarjetaProfesionalFile =
          archivo;

      }


      if (
        tipo === 'antecedentes'
      ) {

        this.formulario.antecedentesFile =
          archivo;

      }


      if (
        tipo === 'hojaDeVida'
      ) {

        this.formulario.hojaDeVidaFile =
          archivo;

      }


      this.cdr.detectChanges();

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


  // ==========================================
  // VALIDACIÓN
  // ==========================================

  tieneError(
    campo: keyof ErroresFormulario
  ): boolean {

    return !!this.errores[campo];

  }


  validarFormulario(): boolean {

    this.errores = {};

    let valido = true;


    if (
      !this.formulario.nombre?.trim()
    ) {

      this.errores.nombre = true;

      valido = false;

    }


    if (
      !this.formulario.apellido?.trim()
    ) {

      this.errores.apellido = true;

      valido = false;

    }


    if (
      !this.formulario.tipoDocumento?.trim()
    ) {

      this.errores.tipoDocumento = true;

      valido = false;

    }


    if (
      !this.formulario.numeroDocumento?.trim()
    ) {

      this.errores.numeroDocumento = true;

      valido = false;

    }


    if (
      !this.formulario.telefono?.trim()
    ) {

      this.errores.telefono = true;

      valido = false;

    }


    if (
      !this.formulario.correo?.trim()
    ) {

      this.errores.correo = true;

      valido = false;

    }


    if (
      !this.formulario.especialidad?.trim()
    ) {

      this.errores.especialidad = true;

      valido = false;

    }


    if (
      !this.formulario.licencia?.trim()
    ) {

      this.errores.licencia = true;

      valido = false;

    }


    return valido;

  }


  // ==========================================
  // ABRIR FORMULARIO
  // ==========================================

  abrirFormulario(
    modo: 'crear' | 'editar',
    id?: number
  ): void {

    this.formularioAbierto =
      true;


    this.modoFormulario =
      modo;


    this.errores = {};


    if (modo === 'crear') {

      this.idEditando = null;

      this.formulario =
        this.formularioInicial();


      this.diasSeleccionados = [];

      this.archivosSubidos = {};

    }


    else if (
      modo === 'editar' &&
      id
    ) {

      const c =
        this.cuidadores.find(
          (item) => item.id === id
        );


      if (c) {

        this.idEditando = id;

        this.formulario = {
          ...c
        };


        this.diasSeleccionados =
          c.diasDisponibles
            ? [...c.diasDisponibles]
            : [];


        this.calcularEdad();

      }

    }


    this.cdr.detectChanges();

  }


  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================

  cerrarFormulario(): void {

    if (this.guardando) return;


    this.formularioAbierto =
      false;


    this.errores = {};


    this.formulario =
      this.formularioInicial();


    this.idEditando = null;


    this.cdr.detectChanges();

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


  cancelarFormulario(): void {

    this.cerrarFormulario();

  }


  // ==========================================
  // GUARDAR CUIDADOR
  // ==========================================

  guardarCuidador(): void {

    // Validamos el formulario
    if (!this.validarFormulario()) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    this.guardando = true;

    // ==========================================
    // 1. DATOS DEL USUARIO
    // ==========================================

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


    console.log('Creando usuario:', cuidador);


    // ==========================================
    // 2. CREAR USUARIO
    // ==========================================

    this.http
      .post<any>(
        'https://geriapp-web-1.onrender.com/api/usuarios/',
        cuidador
      )
      .subscribe({

        next: (respuestaUsuario) => {

          console.log(
            'Usuario creado:',
            respuestaUsuario
          );


          // Obtenemos el ID del usuario recién creado
          const idUsuario =
            respuestaUsuario.id_usuario;


          if (!idUsuario) {

            console.error(
              'La API no devolvió el id_usuario',
              respuestaUsuario
            );

            alert(
              'El usuario fue creado, pero no se pudo crear su perfil profesional.'
            );

            this.guardando = false;

            return;

          }


          // ==========================================
          // 3. DATOS DEL PERFIL PROFESIONAL
          // ==========================================

          const perfilProfesional = {

            id_usuario: idUsuario,

            especialidad:
              this.formulario.especialidad || null,

            licencia:
              this.formulario.licencia || null,

            experiencia:
              this.formulario.experiencia ?? null,

            institucion:
              this.formulario.institucion || null

          };


          console.log(
            'Creando perfil profesional:',
            perfilProfesional
          );


          // ==========================================
          // 4. CREAR PERFIL PROFESIONAL
          // ==========================================

          this.http
            .post<any>(
              'https://geriapp-web-1.onrender.com/api/perfil_profesional/',
              perfilProfesional
            )
            .subscribe({

              next: (respuestaPerfil) => {

                console.log(
                  'Perfil profesional creado:',
                  respuestaPerfil
                );


                // ==========================================
                // 5. FINALIZAR
                // ==========================================

                this.guardando = false;

                alert(
                  'Cuidador y perfil profesional registrados correctamente.'
                );


                this.cerrarFormulario();

                this.cargarCuidadores();

              },


              error: (errorPerfil) => {

                console.error(
                  'Error al crear el perfil profesional:',
                  errorPerfil
                );

                this.guardando = false;

                alert(
                  'El cuidador fue creado, pero ocurrió un error al crear su perfil profesional.'
                );

              }

            });

        },


        error: (errorUsuario) => {

          console.error(
            'Error al crear el usuario:',
            errorUsuario
          );

          this.guardando = false;

          alert(
            'No se pudo registrar el cuidador.'
          );

        }

      });

  }

  // ==========================================
  // MODAL DETALLE
  // ==========================================

  verDetalle(
    cuidador: ICuidador
  ): void {

    this.cuidadorSeleccionado =
      cuidador;


    this.detalleAbierto =
      true;


    this.cdr.detectChanges();

  }


  cerrarDetalle(): void {

    this.detalleAbierto =
      false;


    this.cuidadorSeleccionado =
      null;


    this.cdr.detectChanges();

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


  // ==========================================
  // ELIMINAR
  // ==========================================

  solicitarEliminacion(
    id?: number
  ): void {

    if (!id) return;


    this.idEliminando =
      id;


    this.confirmacionAbierta =
      true;


    this.cdr.detectChanges();

  }


  cerrarConfirmacion(): void {

    this.confirmacionAbierta =
      false;


    this.idEliminando =
      null;


    this.cdr.detectChanges();

  }


  confirmarEliminacion(): void {

    if (!this.idEliminando)
      return;


    this.http
      .delete(
        `${this.apiUrl}${this.idEliminando}/`
      )
      .subscribe({

        next: () => {

          this.cerrarConfirmacion();


          Swal.fire({

            title: 'Eliminado',

            text:
              'El registro ha sido eliminado correctamente.',

            icon: 'success',

            confirmButtonColor:
              '#3B5BDB',

          });


          this.cargarCuidadores();

        },


        error: (err) => {

          console.error(err);


          this.cerrarConfirmacion();


          Swal.fire({

            title: 'Error',

            text:
              'No se pudo eliminar el registro.',

            icon: 'error',

            confirmButtonColor:
              '#3B5BDB',

          });

        },

      });

  }


  // ==========================================
  // AYUDAS VISUALES
  // ==========================================

  obtenerIniciales(
    nombre?: string
  ): string {

    if (!nombre)
      return 'CU';


    const partes =
      nombre
        .trim()
        .split(' ');


    if (
      partes.length >= 2
    ) {

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

      '#228BE6',

    ];


    return colores[
      (id || 0) %
      colores.length
    ];

  }

}

