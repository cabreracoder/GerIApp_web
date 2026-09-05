import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import Swal from 'sweetalert2';

interface PatientForm {
  nombre: string;
  apellidos: string;
  tipoIdentificacion: string;
  documento: string;
  nacimiento: string;
  edad: number | null;
  genero: string;
  grupoSanguineo: string;
  rh: string;
  eps: string;
  fechaIngreso: string;

  familiarNombres: string;
  familiarApellidos: string;
  parentesco: string;
  telefono1: string;
  telefono2: string;
  direccion: string;
  correoElectronico: string;
  municipio: string;

  sede: string;
  habitacion: string;
  cama: string;

  estado: string;
}

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes {

  // =========================================================
  // PACIENTES
  // =========================================================

  patients: any[] = [];

  searchText = '';

  // =========================================================
  // MODALES
  // =========================================================

  modalOpen = false;

  viewModalOpen = false;

  editingId: number | null = null;

  selectedPatient: any = null;

  // =========================================================
  // FORMULARIO
  // =========================================================

  form: PatientForm = this.formularioVacio();

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}
  // =========================================================
  // INICIAR
  // =========================================================

  ngOnInit() {

    this.listar();

  }

  // =========================================================
  // FORMULARIO VACÍO
  // =========================================================

  formularioVacio(): PatientForm {

    return {

      nombre: '',
      apellidos: '',
      tipoIdentificacion: '',
      documento: '',
      nacimiento: '',
      edad: null,
      genero: '',
      grupoSanguineo: '',
      rh: '',
      eps: '',
      fechaIngreso: '',

      familiarNombres: '',
      familiarApellidos: '',
      parentesco: '',
      telefono1: '',
      telefono2: '',
      direccion: '',
      correoElectronico: '',
      municipio: '',

      sede: '',
      habitacion: '',
      cama: '',

      estado: 'active'

    };

  }

  // =========================================================
  // LISTAR PACIENTES - GET
  // =========================================================

  listar() {

    this.http.get<any[]>(
      'http://127.0.0.1:8000/api/pacientes/'
    ).subscribe({

      next: (respuesta) => {
        console.log('Pacientes recibidos:', respuesta);

        this.patients = respuesta;

        console.log('TOTAL PACIENTES:', this.patients.length);
        console.log('PRIMER PACIENTE:', this.patients[0]);

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error al obtener los pacientes:',
          error
        );

      }

    });

  }

  // =========================================================
  // FILTRAR PACIENTES
  // =========================================================

  get filteredPatients(): any[] {

    const texto =
      this.searchText
        .trim()
        .toLowerCase();

    if (!texto) {

      return this.patients;

    }

    return this.patients.filter((patient) => {

      const nombreCompleto =
        `${patient.nombre || ''} ${patient.apellido || ''}`
          .toLowerCase();

      const documento =
        (patient.numero_documento || '')
          .toString()
          .toLowerCase();

      return (
        nombreCompleto.includes(texto) ||
        documento.includes(texto)
      );

    });

  }

  // =========================================================
  // CALCULAR EDAD PARA LA TABLA
  // =========================================================

  calcularEdadPaciente(
    fechaNacimiento: string
  ): number {

    if (!fechaNacimiento) {

      return 0;

    }

    const nacimiento =
      new Date(fechaNacimiento);

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

    return edad;

  }

  // =========================================================
  // NUEVO PACIENTE
  // =========================================================

  nuevo() {

    this.form =
      this.formularioVacio();

    this.editingId = null;

    this.modalOpen = true;

  }

  // =========================================================
  // EDITAR PACIENTE
  // =========================================================

  editarPaciente(patient: any) {

  this.editingId = patient.id_paciente;

  // Primero cargamos los datos del paciente
  this.form = {

    nombre:
      patient.nombre || '',

    apellidos:
      patient.apellido || '',

    tipoIdentificacion:
      patient.tipo_documento || '',

    documento:
      patient.numero_documento || '',

    nacimiento:
      patient.fecha_nacimiento || '',

    edad:
      null,

    genero:
      patient.genero || '',

    grupoSanguineo:
      patient.grupo_sanguineo || '',

    rh:
      patient.rh || '',

    eps:
      patient.eps || '',

    fechaIngreso:
      patient.fecha_ingreso
        ? patient.fecha_ingreso.substring(0, 10)
        : '',

    // Por ahora vacíos.
    // Los llenaremos con la información del familiar.
    familiarNombres: '',
    familiarApellidos: '',
    parentesco: '',
    telefono1: '',
    telefono2: '',
    direccion: '',
    correoElectronico: '',
    municipio: '',

    sede:
      patient.sede || '',

    habitacion:
      patient.habitacion !== null &&
      patient.habitacion !== undefined
        ? patient.habitacion.toString()
        : '',

    cama:
      patient.cama !== null &&
      patient.cama !== undefined
        ? patient.cama.toString()
        : '',

    estado:
      patient.estado
        ? 'active'
        : 'inactive'
  };

  // Calcular edad automáticamente
  if (this.form.nacimiento) {
    this.calcularEdad();
  }

  // Ahora buscamos el familiar responsable de este paciente
  this.http.get<any[]>(
    'http://127.0.0.1:8000/api/familiar_responsable/'
  ).subscribe({

    next: (familiares) => {

      console.log(
        'Familiares recibidos:',
        familiares
      );

      // Buscamos el familiar relacionado con este paciente
      const familiar = familiares.find(
        item =>
          item.id_paciente === patient.id_paciente
      );

      console.log(
        'Familiar del paciente:',
        familiar
      );

      // Si encontramos el familiar, cargamos sus datos
      if (familiar) {

        this.form.familiarNombres =
          familiar.nombres || '';

        this.form.familiarApellidos =
          familiar.apellidos || '';

        this.form.parentesco =
          familiar.parentesco || '';

        this.form.telefono1 =
          familiar.telefono_uno || '';

        this.form.telefono2 =
          familiar.telefono_dos || '';

        this.form.direccion =
          familiar.direccion || '';

        this.form.correoElectronico =
          familiar.correo || '';

        this.form.municipio =
          familiar.municipio || '';

      }

      // Finalmente abrimos el formulario
      this.modalOpen = true;
      this.cdr.detectChanges();

    },

    error: (error) => {

      console.error(
        'Error al obtener el familiar responsable:',
        error
      );

      // Abrimos el formulario aunque no se haya
      // podido cargar el familiar
      this.modalOpen = true;

    }

  });

}

  // =========================================================
  // GUARDAR
  // =========================================================

  guardar() {

    if (this.editar) {

      this.actualizar();

    } else {

      this.crear();

    }

  }

  // =========================================================
  // CREAR - POST
  // =========================================================

  crear() {
  const paciente = {
    nombre: this.form.nombre,
    apellido: this.form.apellidos,
    eps: this.form.eps,
    sede: this.form.sede,
    fecha_ingreso: this.form.fechaIngreso,
    habitacion: Number(this.form.habitacion),
    id_usuario: null,
    tipo_documento: this.form.tipoIdentificacion,
    numero_documento: this.form.documento,
    fecha_nacimiento: this.form.nacimiento,
    genero: this.form.genero,
    grupo_sanguineo: this.form.grupoSanguineo || null,
    rh: this.form.rh || null,
    cama: Number(this.form.cama),
    estado: this.form.estado === 'active'
  };

  console.log('Paciente que se enviará:', paciente);

  // 1. Primero guardamos el paciente
  this.http.post<any>(
    'http://127.0.0.1:8000/api/pacientes/',
    paciente
  ).subscribe({
    next: (respuesta) => {

      console.log('Paciente creado:', respuesta);

      // Obtenemos automáticamente el ID que Django acaba de crear
      const idPaciente = respuesta.id_paciente;

      console.log('ID del paciente creado:', idPaciente);

      // 2. Ahora guardamos el familiar responsable
      const familiar = {
        nombres: this.form.familiarNombres,
        apellidos: this.form.familiarApellidos,
        parentesco: this.form.parentesco,
        telefono_uno: this.form.telefono1,
        telefono_dos: this.form.telefono2 || null,
        direccion: this.form.direccion || null,
        correo: this.form.correoElectronico || null,
        municipio: this.form.municipio || null,
        id_paciente: idPaciente
      };

      console.log('Familiar que se enviará:', familiar);

      this.http.post(
        'http://127.0.0.1:8000/api/familiar_responsable/',
        familiar
      ).subscribe({
        next: (respuestaFamiliar) => {

          console.log('Familiar creado:', respuestaFamiliar);

          // 3. Todo salió bien
          Swal.fire({
            title: 'Paciente registrado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });

          this.listar();
          this.closeModal();
        },

        error: (error) => {
          console.error(
            'Error al crear el familiar responsable:',
            error
          );

          console.error(
            'Detalle del error:',
            error.error
          );

          Swal.fire({
            title: 'Paciente creado, pero hubo un problema',
            text: 'No se pudo guardar el familiar responsable.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          });

          // Actualizamos la tabla porque el paciente sí se creó
          this.listar();
        }
      });
    },

    error: (error) => {

      console.error(
        'Error al crear paciente:',
        error
      );

      console.error(
        'Detalle del error:',
        error.error
      );

      Swal.fire({
        title: 'Error al registrar el paciente',
        text: 'No se pudo guardar el paciente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}
  // =========================================================
  // ACTUALIZAR - PUT
  // =========================================================

  actualizar() {

  if (this.editingId === null) {
    return;
  }

  // =========================================================
  // DATOS DEL PACIENTE
  // =========================================================

  const paciente = {
    nombre: this.form.nombre,
    apellido: this.form.apellidos,
    eps: this.form.eps,
    sede: this.form.sede,
    fecha_ingreso: this.form.fechaIngreso,
    habitacion: Number(this.form.habitacion),
    id_usuario: null,
    tipo_documento: this.form.tipoIdentificacion,
    numero_documento: this.form.documento,
    fecha_nacimiento: this.form.nacimiento,
    genero: this.form.genero,
    grupo_sanguineo: this.form.grupoSanguineo || null,
    rh: this.form.rh || null,
    cama: Number(this.form.cama),
    estado: this.form.estado === 'active'
  };

  console.log(
    'Paciente que se actualizará:',
    paciente
  );

  // =========================================================
  // 1. ACTUALIZAR PACIENTE
  // =========================================================

  this.http.put(
    `http://127.0.0.1:8000/api/pacientes/${this.editingId}/`,
    paciente
  ).subscribe({

    next: (respuesta) => {

      console.log(
        'Paciente actualizado:',
        respuesta
      );

      // =====================================================
      // 2. BUSCAR EL FAMILIAR DEL PACIENTE
      // =====================================================

      this.http.get<any[]>(
        'http://127.0.0.1:8000/api/familiar_responsable/'
      ).subscribe({

        next: (familiares) => {

          const familiar = familiares.find(
            item =>
              item.id_paciente === this.editingId
          );

          console.log(
            'Familiar encontrado:',
            familiar
          );

          // =================================================
          // 3. ACTUALIZAR FAMILIAR
          // =================================================

          if (familiar) {

            const familiarActualizado = {

              nombres:
                this.form.familiarNombres,

              apellidos:
                this.form.familiarApellidos,

              parentesco:
                this.form.parentesco,

              telefono_uno:
                this.form.telefono1,

              telefono_dos:
                this.form.telefono2 || null,

              direccion:
                this.form.direccion || null,

              correo:
                this.form.correoElectronico || null,

              municipio:
                this.form.municipio || null,

              id_paciente:
                this.editingId

            };

            console.log(
              'Familiar que se actualizará:',
              familiarActualizado
            );

            this.http.put(
              `http://127.0.0.1:8000/api/familiar_responsable/${familiar.id_familiar_responsable}/`,
              familiarActualizado
            ).subscribe({

              next: (respuestaFamiliar) => {

                console.log(
                  'Familiar actualizado:',
                  respuestaFamiliar
                );

                // =========================================
                // TODO ACTUALIZADO
                // =========================================

                Swal.fire({
                  title: 'Paciente actualizado correctamente',
                  icon: 'success',
                  confirmButtonText: 'Aceptar'
                });

                this.listar();
                this.closeModal();

              },

              error: (error) => {

                console.error(
                  'Error al actualizar el familiar responsable:',
                  error
                );

                console.error(
                  'Detalle del error:',
                  error.error
                );

                Swal.fire({
                  title: 'Paciente actualizado',
                  text: 'El paciente se actualizó, pero hubo un problema con el familiar responsable.',
                  icon: 'warning',
                  confirmButtonText: 'Aceptar'
                });

                this.listar();

              }

            });

          } else {

            // No se encontró familiar para este paciente
            console.warn(
              'No se encontró familiar responsable para el paciente:',
              this.editingId
            );

            Swal.fire({
              title: 'Paciente actualizado',
              text: 'El paciente se actualizó, pero no se encontró un familiar responsable asociado.',
              icon: 'warning',
              confirmButtonText: 'Aceptar'
            });

            this.listar();
            this.closeModal();

          }

        },

        error: (error) => {

          console.error(
            'Error al obtener los familiares:',
            error
          );

          Swal.fire({
            title: 'Paciente actualizado',
            text: 'El paciente se actualizó, pero no se pudo consultar el familiar responsable.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
          });

          this.listar();

        }

      });

    },

    error: (error) => {

      console.error(
        'Error al actualizar paciente:',
        error
      );

      console.error(
        'Detalle del error:',
        error.error
      );

      Swal.fire({
        title: 'Error al actualizar el paciente',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });

    }

  });

}

 // =========================================================
// ELIMINAR - DELETE
// =========================================================

eliminar(id: number) {

  Swal.fire({
    title: '¿Está seguro de eliminar este paciente?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then((resultado) => {

    if (resultado.isConfirmed) {

      this.http.delete(
        `http://127.0.0.1:8000/api/pacientes/${id}/`
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Paciente eliminado correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });

          this.listar();

        },

        error: (error) => {

          console.error(
            'Error al eliminar paciente:',
            error
          );

          Swal.fire({
            title: 'Error al eliminar el paciente',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });

        }

      });

    }

  });

}
  // =========================================================
  // SABER SI ESTAMOS EDITANDO
  // =========================================================

  get editar(): boolean {

    return this.editingId !== null;

  }

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  openModal(
    mode: 'new' | 'edit',
    patientId?: number
  ) {

    if (mode === 'new') {

      this.nuevo();

      return;

    }

    if (
      patientId !== undefined
    ) {

      const patient =
        this.patients.find(
          item =>
            item.id_paciente === patientId
        );

      if (patient) {

        this.editarPaciente(
          patient
        );

      }

    }

  }

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  closeModal() {

    this.modalOpen = false;

    this.editingId = null;

    this.form =
      this.formularioVacio();

  }

  // =========================================================
  // CERRAR AL HACER CLICK AFUERA
  // =========================================================

  closeOnBackdrop(
    event: MouseEvent
  ) {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.closeModal();

    }

  }

  // =========================================================
  // GUARDAR DESDE HTML
  // =========================================================

  savePatient() {

    this.guardar();

  }

  // =========================================================
  // ELIMINAR DESDE HTML
  // =========================================================

  deletePatient(
    id: number
  ) {

    this.eliminar(id);

  }

  // =========================================================
// CONSULTAR PACIENTE
// =========================================================

viewPatient(id: number) {

  const patient =
    this.patients.find(
      item =>
        item.id_paciente === id
    );

  if (!patient) {
    return;
  }

  // Guardamos primero los datos del paciente
  this.selectedPatient = {
    ...patient,

    familiarNombres: 'No registrado',
    familiarApellidos: 'No registrado',
    parentesco: 'No registrado',
    telefono1: 'No registrado',
    telefono2: 'No registrado',
    direccion: 'No registrado',
    correoElectronico: 'No registrado',
    municipio: 'No registrado'
  };

  // Buscamos el familiar responsable
  this.http.get<any[]>(
    'http://127.0.0.1:8000/api/familiar_responsable/'
  ).subscribe({

    next: (familiares) => {

      console.log(
        'Familiares recibidos para consultar:',
        familiares
      );

      const familiar =
        familiares.find(
          item =>
            item.id_paciente === id
        );

      console.log(
        'Familiar del paciente:',
        familiar
      );

      // Si existe familiar, cargamos sus datos
      if (familiar) {

        this.selectedPatient.familiarNombres =
          familiar.nombres || 'No registrado';

        this.selectedPatient.familiarApellidos =
          familiar.apellidos || 'No registrado';

        this.selectedPatient.parentesco =
          familiar.parentesco || 'No registrado';

        this.selectedPatient.telefono1 =
          familiar.telefono_uno || 'No registrado';

        this.selectedPatient.telefono2 =
          familiar.telefono_dos || 'No registrado';

        this.selectedPatient.direccion =
          familiar.direccion || 'No registrado';

        this.selectedPatient.correoElectronico =
          familiar.correo || 'No registrado';

        this.selectedPatient.municipio =
          familiar.municipio || 'No registrado';
      }

      this.viewModalOpen = true;

      this.cdr.detectChanges();

    },

    error: (error) => {

      console.error(
        'Error al obtener el familiar responsable:',
        error
      );

      // Mostramos igualmente el paciente
      this.viewModalOpen = true;

      this.cdr.detectChanges();

    }

  });

}

  // =========================================================
  // CERRAR CONSULTA
  // =========================================================

  closeViewModal() {

    this.viewModalOpen =
      false;

    this.selectedPatient =
      null;

  }

  // =========================================================
  // CALCULAR EDAD DEL FORMULARIO
  // =========================================================

  calcularEdad() {

    if (!this.form.nacimiento) {

      this.form.edad = null;

      return;

    }

    const nacimiento =
      new Date(
        this.form.nacimiento
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
        hoy.getDate() <
        nacimiento.getDate()
      )
    ) {

      edad--;

    }

    this.form.edad =
      edad;

  }

  // =========================================================
  // TÍTULO DEL MODAL
  // =========================================================

  get modalTitle(): string {

    return this.editar
      ? 'Editar paciente'
      : 'Nuevo paciente';

  }

  // =========================================================
  // TEXTO DEL BOTÓN
  // =========================================================

  get saveButtonText(): string {

    return this.editar
      ? 'Guardar cambios'
      : 'Guardar paciente';

  }

}