import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaindropComponent } from './raindrop.component';

describe('RaindropComponent', () => {
  let component: RaindropComponent;
  let fixture: ComponentFixture<RaindropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaindropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RaindropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
