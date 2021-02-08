import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BamboovaultComponent } from './bamboovault.component';

describe('BamboovaultComponent', () => {
  let component: BamboovaultComponent;
  let fixture: ComponentFixture<BamboovaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BamboovaultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BamboovaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
