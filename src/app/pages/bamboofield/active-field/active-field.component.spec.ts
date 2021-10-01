import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveFieldComponent } from './active-field.component';

describe('ActiveFieldComponent', () => {
  let component: ActiveFieldComponent;
  let fixture: ComponentFixture<ActiveFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
