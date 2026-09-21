import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioPaciente } from './inventario-paciente';

describe('InventarioPaciente', () => {
  let component: InventarioPaciente;
  let fixture: ComponentFixture<InventarioPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioPaciente],
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
