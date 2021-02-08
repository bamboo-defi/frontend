import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToTradeComponent } from './to-trade.component';

describe('ToTradeComponent', () => {
  let component: ToTradeComponent;
  let fixture: ComponentFixture<ToTradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToTradeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
