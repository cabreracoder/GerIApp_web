import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Patient {
  id: number;
  doc: string;
  name: string;
  age: number;
  room: string;
  status: 'Estable' | 'Atención' | 'Crítico';
  lastCheck: string;
  adherence: number;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  shift: 'Mañana' | 'Tarde' | 'Noche';
  status: 'En Turno' | 'Libre';
  tasksCompleted: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser = { name: 'Jose Cabrera', role: 'ADMINISTRADOR', initials: 'JC' };
  searchTerm: string = '';
  unreadAlertsCount: number = 3;

  startDate: string = '2026-08-01';
  endDate: string = '2026-08-22';
  selectedStaffFilter: string = 'TODOS';

  showReportModal: boolean = false;
  reportType: 'pacientes' | 'personal' = 'pacientes';
  previewData: any[] = [];
  isExporting: boolean = false;
  exportError: string | null = null;

  patients: Patient[] = [
    { id: 1, doc: '104523891', name: 'Rosa Elena Gómez', age: 82, room: '101-A', status: 'Estable', lastCheck: '08:00 AM', adherence: 95 },
    { id: 2, doc: '109823411', name: 'Carlos Alberto Ríos', age: 78, room: '102-B', status: 'Atención', lastCheck: '07:30 AM', adherence: 60 },
    { id: 3, doc: '982341231', name: 'María Inés Zapata', age: 85, room: '104-A', status: 'Crítico', lastCheck: '08:15 AM', adherence: 40 },
    { id: 4, doc: '128491022', name: 'Hernán Martínez', age: 74, room: '201-B', status: 'Estable', lastCheck: '06:45 AM', adherence: 100 }
  ];

  filteredPatients: Patient[] = [];

  staffMembers: Staff[] = [
    { id: 1, name: 'Ana Isabel Pérez', role: 'Enfermera Jefa', shift: 'Mañana', status: 'En Turno', tasksCompleted: 18 },
    { id: 2, name: 'David Fernando Mina', role: 'Cuidador principal', shift: 'Mañana', status: 'En Turno', tasksCompleted: 14 },
    { id: 3, name: 'Yuleidi Mosquera', role: 'Fisioterapeuta', shift: 'Tarde', status: 'Libre', tasksCompleted: 8 },
    { id: 4, name: 'Yeison Javier López', role: 'Cuidador nocturno', shift: 'Noche', status: 'Libre', tasksCompleted: 12 }
  ];

  filteredStaff: Staff[] = [];

  ngOnInit(): void {
    this.applyFilters();
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPatients = this.patients.filter(p => 
      p.name.toLowerCase().includes(term) || p.doc.includes(term)
    );
  }

  applyFilters(): void {
    this.filteredPatients = [...this.patients];
    if (this.selectedStaffFilter === 'TODOS') {
      this.filteredStaff = [...this.staffMembers];
    } else {
      this.filteredStaff = this.staffMembers.filter(s => s.shift === this.selectedStaffFilter);
    }
  }

  openReportModal(type: 'pacientes' | 'personal'): void {
    this.reportType = type;
    this.exportError = null;
    this.showReportModal = true;
    this.generatePreview();
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  generatePreview(): void {
    if (this.reportType === 'pacientes') {
      this.previewData = [...this.filteredPatients];
    } else {
      this.previewData = [...this.filteredStaff];
    }
  }

  exportData(format: 'PDF' | 'EXCEL'): void {
    if (this.previewData.length === 0) {
      this.exportError = 'No hay datos disponibles para exportar en el rango seleccionado.';
      return;
    }

    this.isExporting = true;
    this.exportError = null;

    setTimeout(() => {
      this.isExporting = false;
      const fileName = `Reporte_${this.reportType.toUpperCase()}_${this.startDate}_al_${this.endDate}.${format.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx'}`;
      alert(`¡Exportación exitosa! Se ha descargado el archivo: ${fileName}`);
      this.closeReportModal();
    }, 1200);
  }

  get totalPatientsCount(): number { return this.patients.length; }
  get criticalPatientsCount(): number { return this.patients.filter(p => p.status === 'Crítico').length; }
  get activeStaffCount(): number { return this.staffMembers.filter(s => s.status === 'En Turno').length; }
  get averageAdherence(): number {
    const sum = this.patients.reduce((acc, p) => acc + p.adherence, 0);
    return Math.round(sum / (this.patients.length || 1));
  }
}