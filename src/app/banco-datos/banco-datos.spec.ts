import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BancoDatos } from './banco-datos';

describe('BancoDatos', () => {
  let component: BancoDatos;
  let fixture: ComponentFixture<BancoDatos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BancoDatos],
    }).compileComponents();

    fixture = TestBed.createComponent(BancoDatos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
