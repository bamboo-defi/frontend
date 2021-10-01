import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApyComponent } from './apy.component';

describe('ApyComponent', () => {
  let component: ApyComponent;
  let fixture: ComponentFixture<ApyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
