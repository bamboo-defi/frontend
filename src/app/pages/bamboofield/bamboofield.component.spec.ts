import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BamboofieldComponent } from './bamboofield.component';

describe('BamboofieldComponent', () => {
  let component: BamboofieldComponent;
  let fixture: ComponentFixture<BamboofieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BamboofieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BamboofieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
