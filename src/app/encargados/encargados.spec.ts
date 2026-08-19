import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Encargados } from './encargados';

describe('Encargados', () => {
  let component: Encargados;
  let fixture: ComponentFixture<Encargados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Encargados],
    }).compileComponents();

    fixture = TestBed.createComponent(Encargados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
