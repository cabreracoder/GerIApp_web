import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  constructor(private http: HttpClient) {}

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

        console.log(
          'Pacientes recibidos:',
          respuesta
        );

        this.patients = respuesta;
        

      console.log('TOTAL PACIENTES:', this.patients.length);
      console.log('PRIMER PACIENTE:', this.patients[0]);

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

  editarPaciente(
    patient: any
  ) {

    this.editingId =
      patient.id_paciente;

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

    this.modalOpen = true;

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

    console.log(
      'POST todavía no conectado'
    );

  }

  // =========================================================
  // ACTUALIZAR - PUT
  // =========================================================

  actualizar() {

    console.log(
      'PUT todavía no conectado'
    );

  }

  // =========================================================
  // ELIMINAR - DELETE
  // =========================================================

  eliminar(
    id: number
  ) {

    console.log(
      'DELETE todavía no conectado:',
      id
    );

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

  viewPatient(
    id: number
  ) {

    const patient =
      this.patients.find(
        item =>
          item.id_paciente === id
      );

    if (!patient) {

      return;

    }

    this.selectedPatient =
      patient;

    this.viewModalOpen =
      true;

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