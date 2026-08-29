
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PatientStatus = 'stable' | 'critical' | 'observation';

interface Patient {
  id: number;
  name: string;
  doc: string;
  age: number;
  birthDate: string;
  room: string;
  guardian: string;
  guardianRel: string;
  caregiver: string;
  pavilion: string;
  status: PatientStatus;
  phone: string;
  email: string;
  notes: string;
  gender: string;
  bloodType: string;
  admissionDate: string;
  diagnosis: string;
  eps: string;
  headquarters: string;
  medications: string;
  guardianAddress: string;
}

interface PatientForm {
  nombre: string;
  documento: string;
  nacimiento: string;
  edad: number | null;
  habitacion: string;
  estado: PatientStatus;
  cuidador: string;
  pabellon: string;
  encargado: string;
  relacion: string;
  telefono: string;
  email: string;
  notas: string;
  genero: string;
  tipoSangre: string;
  fechaIngreso: string;
  diagnostico: string;
  eps: string;
  sede: string;
  medicamentos: string;
  direccion: string;
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
  // FILTROS
  // =========================================================

  searchText = '';
  pavilionFilter = '';
  statusFilter: PatientStatus | '' = '';

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  currentPage = 1;
  pageSize = 8;

  // =========================================================
  // MODAL DE CREACIÓN / EDICIÓN
  // =========================================================

  modalOpen = false;
  editingId: number | null = null;

  // =========================================================
  // MODAL DE CONSULTA
  // =========================================================

  viewModalOpen = false;
  selectedPatient: Patient | null = null;

  // =========================================================
  // FORMULARIO
  // =========================================================

  form: PatientForm = this.createEmptyForm();

  // =========================================================
  // PACIENTES
  // =========================================================
  // Los pacientes serán cargados posteriormente desde la API.

  patients: Patient[] = [];

  // =========================================================
  // OPCIONES DEL FORMULARIO
  // =========================================================
  // Estas listas se conectarán posteriormente con los datos
  // provenientes de la API correspondiente.

  pavilions: string[] = [];
  caregivers: { id: number; name: string }[] = [];

  // =========================================================
  // FORMULARIO VACÍO
  // =========================================================

  createEmptyForm(): PatientForm {
    return {
      nombre: '',
      documento: '',
      nacimiento: '',
      edad: null,
      habitacion: '',
      estado: 'stable',
      cuidador: '',
      pabellon: '',
      encargado: '',
      relacion: '',
      telefono: '',
      email: '',
      notas: '',
      genero: '',
      tipoSangre: '',
      fechaIngreso: '',
      diagnostico: '',
      eps: '',
      sede: '',
      medicamentos: '',
      direccion: ''
    };
  }

  // =========================================================
  // PACIENTES FILTRADOS
  // =========================================================

  get filteredPatients(): Patient[] {
    const search = this.searchText.trim().toLowerCase();

    return this.patients.filter(patient => {

      const matchesSearch =
        !search ||
        patient.name.toLowerCase().includes(search) ||
        patient.doc.toLowerCase().includes(search) ||
        patient.guardian.toLowerCase().includes(search) ||
        patient.caregiver.toLowerCase().includes(search);

      const matchesPavilion =
        !this.pavilionFilter ||
        patient.pavilion === this.pavilionFilter;

      const matchesStatus =
        !this.statusFilter ||
        patient.status === this.statusFilter;

      return (
        matchesSearch &&
        matchesPavilion &&
        matchesStatus
      );
    });
  }

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredPatients.length / this.pageSize
      )
    );
  }

  get paginatedPatients(): Patient[] {
    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredPatients.slice(
      start,
      start + this.pageSize
    );
  }

  get firstShown(): number {
    if (this.filteredPatients.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
      this.pageSize
    ) + 1;
  }

  get lastShown(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredPatients.length
    );
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
  }

  filterTable(): void {
    this.currentPage = 1;
  }

  // =========================================================
  // ESTADÍSTICAS
  // =========================================================

  get totalActive(): number {
    return this.patients.length;
  }

  get stablePatients(): number {
    return this.patients.filter(
      patient => patient.status === 'stable'
    ).length;
  }

  get criticalPatients(): number {
    return this.patients.filter(
      patient => patient.status === 'critical'
    ).length;
  }

  get observationPatients(): number {
    return this.patients.filter(
      patient => patient.status === 'observation'
    ).length;
  }

  get occupancy(): number {
    return 0;
  }

  // =========================================================
  // MODAL
  // =========================================================

  get modalTitle(): string {
    return this.editingId === null
      ? 'Nuevo paciente'
      : 'Editar paciente';
  }

  get saveButtonText(): string {
    return this.editingId === null
      ? 'Guardar paciente'
      : 'Guardar cambios';
  }

  openModal(
    mode: 'new' | 'edit',
    patientId?: number
  ): void {

    this.modalOpen = true;
    this.editingId = null;

    if (mode === 'new') {
      this.form = this.createEmptyForm();
      return;
    }

    if (patientId === undefined) {
      return;
    }

    const patient = this.patients.find(
      item => item.id === patientId
    );

    if (!patient) {
      return;
    }

    this.editingId = patient.id;

    this.form = {
      nombre: patient.name,
      documento: patient.doc,
      nacimiento: patient.birthDate,
      edad: patient.age,
      habitacion: patient.room,
      estado: patient.status,
      cuidador: patient.caregiver,
      pabellon: patient.pavilion,
      encargado: patient.guardian,
      relacion: patient.guardianRel,
      telefono: patient.phone,
      email: patient.email,
      notas: patient.notes,
      genero: patient.gender,
      tipoSangre: patient.bloodType,
      fechaIngreso: patient.admissionDate,
      diagnostico: patient.diagnosis,
      eps: patient.eps,
      sede: patient.headquarters,
      medicamentos: patient.medications,
      direccion: patient.guardianAddress
    };
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = this.createEmptyForm();
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (
      event.target === event.currentTarget
    ) {
      this.closeModal();
    }
  }

  // =========================================================
  // CONSULTAR PACIENTE
  // =========================================================

  viewPatient(id: number): void {

    const patient = this.patients.find(
      item => item.id === id
    );

    if (!patient) {
      return;
    }

    this.selectedPatient = patient;
    this.viewModalOpen = true;
  }

  closeViewModal(): void {
    this.viewModalOpen = false;
    this.selectedPatient = null;
  }

  // =========================================================
  // GUARDAR PACIENTE
  // =========================================================
  // La persistencia se implementará mediante el servicio.

  savePatient(): void {
    if (!this.validarFormulario()) {
      return;
    }

    // Pendiente de conectar con PacientesService.
  }

  // =========================================================
  // VALIDACIÓN
  // =========================================================

  validarFormulario(): boolean {

    if (!this.form.nombre.trim()) {
      alert('Ingrese el nombre completo.');
      return false;
    }

    if (!this.form.documento.trim()) {
      alert('Ingrese el documento.');
      return false;
    }

    if (!this.form.nacimiento) {
      alert('Ingrese la fecha de nacimiento.');
      return false;
    }

    if (
      this.form.edad === null ||
      this.form.edad < 50 ||
      this.form.edad > 120
    ) {
      alert(
        'La edad debe estar entre 50 y 120 años.'
      );
      return false;
    }

    if (!this.form.habitacion.trim()) {
      alert('Ingrese la habitación.');
      return false;
    }

    if (!this.form.encargado.trim()) {
      alert(
        'Ingrese el encargado familiar.'
      );
      return false;
    }

    if (!this.form.telefono.trim()) {
      alert('Ingrese el teléfono.');
      return false;
    }

    return true;
  }

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================
  // La actualización se realizará mediante la API.

  toggleStatus(id: number): void {

    const patient = this.patients.find(
      item => item.id === id
    );

    if (!patient) {
      return;
    }

    const nextStatus: PatientStatus =
      patient.status === 'stable'
        ? 'observation'
        : 'stable';

    patient.status = nextStatus;

    this.patients = [...this.patients];
  }

  // =========================================================
  // ELIMINAR
  // =========================================================
  // La eliminación se realizará mediante la API.

  deletePatient(id: number): void {

    const patient = this.patients.find(
      item => item.id === id
    );

    if (!patient) {
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de eliminar a ${patient.name}?`
      )
    ) {
      return;
    }

    this.patients = this.patients.filter(
      item => item.id !== id
    );

    if (
      this.currentPage > this.totalPages
    ) {
      this.currentPage = this.totalPages;
    }
  }

  // =========================================================
  // AVATAR
  // =========================================================

  getAvatarColor(
    status: PatientStatus
  ): string {

    switch (status) {

      case 'critical':
        return '#fee2e2';

      case 'observation':
        return '#fef3c7';

      default:
        return '#dbeafe';
    }
  }
}

