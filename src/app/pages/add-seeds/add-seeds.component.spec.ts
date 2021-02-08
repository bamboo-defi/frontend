import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSeedsComponent } from './add-seeds.component';

describe('AddSeedsComponent', () => {
  let component: AddSeedsComponent;
  let fixture: ComponentFixture<AddSeedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSeedsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
