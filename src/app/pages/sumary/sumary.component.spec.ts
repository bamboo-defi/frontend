import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SumaryComponent } from './sumary.component';

describe('SumaryComponent', () => {
  let component: SumaryComponent;
  let fixture: ComponentFixture<SumaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SumaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SumaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
