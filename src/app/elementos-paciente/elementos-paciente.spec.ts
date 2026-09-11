import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementosPaciente } from './elementos-paciente';

describe('ElementosPaciente', () => {
  let component: ElementosPaciente;
  let fixture: ComponentFixture<ElementosPaciente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementosPaciente],
    }).compileComponents();

    fixture = TestBed.createComponent(ElementosPaciente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
