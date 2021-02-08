import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToStakeComponent } from './to-stake.component';

describe('ToStakeComponent', () => {
  let component: ToStakeComponent;
  let fixture: ComponentFixture<ToStakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToStakeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToStakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
