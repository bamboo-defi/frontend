import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PandaspinnerComponent } from './pandaspinner.component';

describe('PandaspinnerComponent', () => {
  let component: PandaspinnerComponent;
  let fixture: ComponentFixture<PandaspinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PandaspinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PandaspinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
