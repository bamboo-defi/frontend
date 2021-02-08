import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LendingComponent } from './lending.component';

describe('LendingComponent', () => {
  let component: LendingComponent;
  let fixture: ComponentFixture<LendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LendingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
