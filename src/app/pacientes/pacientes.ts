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
  // MODAL
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
  // LISTAR - GET
  // =========================================================

  listar() {

    this.http.get<any[]>(
      'AQUI_VA_LA_URL_GET'
    ).subscribe((respuesta) => {

      this.patients = respuesta;

    });
  }


  // =========================================================
  // FILTRAR PACIENTES
  // =========================================================

  get filteredPatients(): any[] {

    const texto = this.searchText
      .trim()
      .toLowerCase();

    if (!texto) {
      return this.patients;
    }

    return this.patients.filter((patient) => {

      const nombre =
        (patient.nombre ||
         patient.name ||
         '').toLowerCase();

      const apellidos =
        (patient.apellidos || '').toLowerCase();

      const documento =
        (patient.documento ||
         patient.doc ||
         '').toLowerCase();

      return (
        nombre.includes(texto) ||
        apellidos.includes(texto) ||
        documento.includes(texto)
      );

    });
  }


  // =========================================================
  // NUEVO PACIENTE
  // =========================================================

  nuevo() {

    this.form = this.formularioVacio();

    this.editingId = null;

    this.modalOpen = true;
  }


  // =========================================================
  // EDITAR PACIENTE
  // =========================================================

  editarPaciente(patient: any) {

    this.editingId = patient.id;

    this.form = {

      nombre: patient.nombre || '',
      apellidos: patient.apellidos || '',
      tipoIdentificacion:
        patient.tipoIdentificacion || '',
      documento:
        patient.documento || patient.doc || '',
      nacimiento:
        patient.nacimiento || patient.birthDate || '',
      edad:
        patient.edad ?? patient.age ?? null,
      genero:
        patient.genero || patient.gender || '',
      grupoSanguineo:
        patient.grupoSanguineo || '',
      rh:
        patient.rh || '',
      eps:
        patient.eps || '',
      fechaIngreso:
        patient.fechaIngreso || '',

      familiarNombres:
        patient.familiarNombres || '',
      familiarApellidos:
        patient.familiarApellidos || '',
      parentesco:
        patient.parentesco || '',
      telefono1:
        patient.telefono1 || patient.phone || '',
      telefono2:
        patient.telefono2 || '',
      direccion:
        patient.direccion || '',
      correoElectronico:
        patient.correoElectronico || patient.email || '',
      municipio:
        patient.municipio || '',

      sede:
        patient.sede || '',
      habitacion:
        patient.habitacion || patient.room || '',
      cama:
        patient.cama || '',

      estado:
        patient.estado || patient.status || 'active'
    };

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

    this.http.post(
      'AQUI_VA_LA_URL_POST',
      this.form
    ).subscribe(() => {

      alert('Paciente guardado');

      this.listar();

      this.closeModal();

    });
  }


  // =========================================================
  // ACTUALIZAR - PUT
  // =========================================================

  actualizar() {

    this.http.put(
      'AQUI_VA_LA_URL_PUT/' + this.editingId + '/',
      this.form
    ).subscribe(() => {

      alert('Paciente actualizado');

      this.listar();

      this.closeModal();

    });
  }


  // =========================================================
  // ELIMINAR - DELETE
  // =========================================================

  eliminar(id: number) {

    if (!confirm('¿Está seguro de eliminar este paciente?')) {
      return;
    }

    this.http.delete(
      'AQUI_VA_LA_URL_DELETE/' + id + '/'
    ).subscribe(() => {

      alert('Paciente eliminado');

      this.listar();

    });
  }


  // =========================================================
  // EDITAR
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

    if (patientId !== undefined) {

      const patient = this.patients.find(
        item => item.id === patientId
      );

      if (patient) {

        this.editarPaciente(patient);

      }
    }
  }


  // =========================================================
  // CERRAR MODAL
  // =========================================================

  closeModal() {

    this.modalOpen = false;

    this.editingId = null;

    this.form = this.formularioVacio();
  }


  // =========================================================
  // CERRAR AL HACER CLICK AFUERA
  // =========================================================

  closeOnBackdrop(event: MouseEvent) {

    if (
      event.target === event.currentTarget
    ) {

      this.closeModal();

    }
  }


  // =========================================================
  // GUARDAR DESDE EL HTML
  // =========================================================

  savePatient() {

    this.guardar();
  }


  // =========================================================
  // ELIMINAR DESDE EL HTML
  // =========================================================

  deletePatient(id: number) {

    this.eliminar(id);
  }


  // =========================================================
  // CONSULTAR PACIENTE
  // =========================================================

  viewPatient(id: number) {

    const patient = this.patients.find(
      item => item.id === id
    );

    if (!patient) {
      return;
    }

    this.selectedPatient = patient;

    this.viewModalOpen = true;
  }


  // =========================================================
  // CERRAR CONSULTA
  // =========================================================

  closeViewModal() {

    this.viewModalOpen = false;

    this.selectedPatient = null;
  }


  // =========================================================
  // CALCULAR EDAD
  // =========================================================

  calcularEdad() {

    if (!this.form.nacimiento) {

      this.form.edad = null;

      return;
    }

    const nacimiento =
      new Date(this.form.nacimiento);

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

    this.form.edad = edad;
  }


  // =========================================================
  // TEXTO DEL MODAL
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