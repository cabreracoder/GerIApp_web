import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cuidadores } from './cuidadores';

describe('Cuidadores', () => {
  let component: Cuidadores;
  let fixture: ComponentFixture<Cuidadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cuidadores],
    }).compileComponents();

    fixture = TestBed.createComponent(Cuidadores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
