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
  // BÚSQUEDA Y FILTROS
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
  // MODAL
  // =========================================================

  modalOpen = false;
  editingId: number | null = null;

  // =========================================================
// MODAL DE CONSULTA DE OACIENTES
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

  patients: Patient[] = [
    {
      id: 1,
      name: 'Ricardo Mendoza',
      doc: '10.455.672',
      age: 82,
      birthDate: '1944-03-12',
      room: '104',
      guardian: 'Elena Mendoza',
      guardianRel: 'Hija',
      caregiver: 'Enf. Carlos Ruiz',
      pavilion: 'Ala Norte',
      status: 'stable',
      phone: '3124567890',
      email: 'elena.mendoza@mail.com',
      notes: 'Control médico periódico.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 2,
      name: 'Carmen Torres',
      doc: '31.225.891',
      age: 78,
      birthDate: '1948-06-20',
      room: '108',
      guardian: 'Luis Torres',
      guardianRel: 'Hijo',
      caregiver: 'Dra. Martha Luz',
      pavilion: 'Ala Norte',
      status: 'observation',
      phone: '3105551122',
      email: 'luis.torres@mail.com',
      notes: 'En observación por control de presión.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 3,
      name: 'Jorge Ramírez',
      doc: '12.889.456',
      age: 86,
      birthDate: '1940-01-15',
      room: '203',
      guardian: 'María Ramírez',
      guardianRel: 'Hija',
      caregiver: 'Enf. Laura Paz',
      pavilion: 'Ala Sur',
      status: 'critical',
      phone: '3158882233',
      email: 'maria.ramirez@mail.com',
      notes: 'Requiere monitoreo constante.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 4,
      name: 'Ana Martínez',
      doc: '28.334.781',
      age: 74,
      birthDate: '1952-09-05',
      room: '210',
      guardian: 'Carlos Martínez',
      guardianRel: 'Hijo',
      caregiver: 'Enf. Ana Reyes',
      pavilion: 'Ala Sur',
      status: 'stable',
      phone: '3001112233',
      email: 'carlos.martinez@mail.com',
      notes: 'Paciente estable.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 5,
      name: 'Pedro Gómez',
      doc: '15.672.334',
      age: 90,
      birthDate: '1936-04-11',
      room: '302',
      guardian: 'Laura Gómez',
      guardianRel: 'Hija',
      caregiver: 'Juan Vela',
      pavilion: 'Ala Este',
      status: 'stable',
      phone: '3184567891',
      email: 'laura.gomez@mail.com',
      notes: 'Seguimiento nutricional.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 6,
      name: 'Marta López',
      doc: '26.784.551',
      age: 81,
      birthDate: '1945-07-23',
      room: '305',
      guardian: 'Diego López',
      guardianRel: 'Hijo',
      caregiver: 'Enf. Carlos Ruiz',
      pavilion: 'Ala Este',
      status: 'observation',
      phone: '3167891122',
      email: 'diego.lopez@mail.com',
      notes: 'Observación médica.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 7,
      name: 'Alberto Castro',
      doc: '11.224.998',
      age: 88,
      birthDate: '1938-02-17',
      room: '109',
      guardian: 'Sofía Castro',
      guardianRel: 'Hija',
      caregiver: 'Dra. Martha Luz',
      pavilion: 'Ala Norte',
      status: 'critical',
      phone: '3012223344',
      email: 'sofia.castro@mail.com',
      notes: 'Requiere atención especial.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 8,
      name: 'Rosa Fernández',
      doc: '35.781.223',
      age: 76,
      birthDate: '1950-11-30',
      room: '215',
      guardian: 'Miguel Fernández',
      guardianRel: 'Hijo',
      caregiver: 'Enf. Laura Paz',
      pavilion: 'Ala Sur',
      status: 'stable',
      phone: '3134455667',
      email: 'miguel.fernandez@mail.com',
      notes: 'Paciente estable.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 9,
      name: 'Manuel Vargas',
      doc: '19.672.882',
      age: 84,
      birthDate: '1942-05-18',
      room: '307',
      guardian: 'Patricia Vargas',
      guardianRel: 'Hija',
      caregiver: 'Juan Vela',
      pavilion: 'Ala Este',
      status: 'stable',
      phone: '3204455667',
      email: 'patricia.vargas@mail.com',
      notes: 'Control general.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    },
    {
      id: 10,
      name: 'Gloria Herrera',
      doc: '27.882.331',
      age: 79,
      birthDate: '1947-12-04',
      room: '112',
      guardian: 'Andrés Herrera',
      guardianRel: 'Hijo',
      caregiver: 'Enf. Ana Reyes',
      pavilion: 'Ala Norte',
      status: 'observation',
      phone: '3147788990',
      email: 'andres.herrera@mail.com',
      notes: 'Control y observación.',
      gender: '',
      bloodType: '',
      admissionDate: '',
      diagnosis: '',
      eps: '',
      headquarters: '',
      medications: '',
      guardianAddress: ''
    }
  ];

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
      cuidador: 'Enf. Carlos Ruiz',
      pabellon: 'Ala Norte',
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

      return matchesSearch && matchesPavilion && matchesStatus;
    });
  }

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredPatients.length / this.pageSize)
    );
  }

  get paginatedPatients(): Patient[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPatients.slice(start, start + this.pageSize);
  }

  get firstShown(): number {
    if (this.filteredPatients.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get lastShown(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredPatients.length
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
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
    return this.patients.filter(p => p.status === 'stable').length;
  }

  get criticalPatients(): number {
    return this.patients.filter(p => p.status === 'critical').length;
  }

  get observationPatients(): number {
    return this.patients.filter(p => p.status === 'observation').length;
  }

  get occupancy(): number {
    const capacity = 135;
    return Math.round((this.totalActive / capacity) * 100);
  }

  // =========================================================
  // MODAL
  // =========================================================

  get modalTitle(): string {
    return this.editingId === null ? 'Nuevo paciente' : 'Editar paciente';
  }

  get saveButtonText(): string {
    return this.editingId === null ? 'Guardar paciente' : 'Guardar cambios';
  }

  openModal(mode: 'new' | 'edit', patientId?: number): void {
    this.modalOpen = true;
    this.editingId = null;

    if (mode === 'new') {
      this.form = this.createEmptyForm();
      return;
    }

    if (patientId !== undefined) {
      const patient = this.patients.find(item => item.id === patientId);
      if (!patient) return;

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
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = this.createEmptyForm();
  }

  closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

 // =========================================================
    // CONSULTAR PACIENTE
    // =========================================================


  viewPatient(id: number): void {

    const patient = this.patients.find(item => item.id === id);

    if (!patient) return;

    this.selectedPatient = patient;

    this.viewModalOpen = true;
  }

  closeViewModal(): void {

  this.viewModalOpen = false;

  this.selectedPatient = null;
}

  // =========================================================
  // GUARDAR
  // =========================================================

  savePatient(): void {
    if (!this.validarFormulario()) return;

    if (this.editingId === null) {
      const newId =
        this.patients.length > 0
          ? Math.max(...this.patients.map(p => p.id)) + 1
          : 1;

      const newPatient: Patient = {
        id: newId,
        name: this.form.nombre.trim(),
        doc: this.form.documento.trim(),
        age: this.form.edad ?? 0,
        birthDate: this.form.nacimiento,
        room: this.form.habitacion.trim(),
        guardian: this.form.encargado.trim(),
        guardianRel: this.form.relacion.trim(),
        caregiver: this.form.cuidador,
        pavilion: this.form.pabellon,
        status: this.form.estado,
        phone: this.form.telefono.trim(),
        email: this.form.email.trim(),
        notes: this.form.notas.trim(),
        gender: this.form.genero,
        bloodType: this.form.tipoSangre,
        admissionDate: this.form.fechaIngreso,
        diagnosis: this.form.diagnostico.trim(),
        eps: this.form.eps.trim(),
        headquarters: this.form.sede.trim(),
        medications: this.form.medicamentos.trim(),
        guardianAddress: this.form.direccion.trim()
      };

      this.patients = [...this.patients, newPatient];
      this.closeModal();
      return;
    }

    const index = this.patients.findIndex(p => p.id === this.editingId);
    if (index === -1) return;

    this.patients[index] = {
      ...this.patients[index],
      name: this.form.nombre.trim(),
      doc: this.form.documento.trim(),
      age: this.form.edad ?? 0,
      birthDate: this.form.nacimiento,
      room: this.form.habitacion.trim(),
      guardian: this.form.encargado.trim(),
      guardianRel: this.form.relacion.trim(),
      caregiver: this.form.cuidador,
      pavilion: this.form.pabellon,
      status: this.form.estado,
      phone: this.form.telefono.trim(),
      email: this.form.email.trim(),
      notes: this.form.notas.trim(),
      gender: this.form.genero,
      bloodType: this.form.tipoSangre,
      admissionDate: this.form.fechaIngreso,
      diagnosis: this.form.diagnostico.trim(),
      eps: this.form.eps.trim(),
      headquarters: this.form.sede.trim(),
      medications: this.form.medicamentos.trim(),
      guardianAddress: this.form.direccion.trim()
    };

    this.patients = [...this.patients];
    this.closeModal();
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
      alert('La edad debe estar entre 50 y 120 años.');
      return false;
    }
    if (!this.form.habitacion.trim()) {
      alert('Ingrese la habitación.');
      return false;
    }
    if (!this.form.encargado.trim()) {
      alert('Ingrese el encargado familiar.');
      return false;
    }
    if (!this.form.telefono.trim()) {
      alert('Ingrese el teléfono.');
      return false;
    }
    return true;
  }

  // =========================================================
  // ESTADO Y ELIMINAR
  // =========================================================

  toggleStatus(id: number): void {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) return;

    this.patients[index].status =
      this.patients[index].status === 'stable' ? 'observation' : 'stable';
    this.patients = [...this.patients];
  }

  deletePatient(id: number): void {
    const patient = this.patients.find(item => item.id === id);
    if (!patient) return;

    if (!window.confirm(`¿Está seguro de eliminar a ${patient.name}?`)) return;

    this.patients = this.patients.filter(item => item.id !== id);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  getAvatarColor(status: PatientStatus): string {
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