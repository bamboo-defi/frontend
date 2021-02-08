import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidityPlusComponent } from './liquidity-plus.component';

describe('LiquidityPlusComponent', () => {
  let component: LiquidityPlusComponent;
  let fixture: ComponentFixture<LiquidityPlusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidityPlusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidityPlusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
