import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairCreateComponent } from './pair-create.component';

describe('PairCreateComponent', () => {
  let component: PairCreateComponent;
  let fixture: ComponentFixture<PairCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PairCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PairCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
