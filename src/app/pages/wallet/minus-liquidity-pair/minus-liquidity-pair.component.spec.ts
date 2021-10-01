import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinusLiquidityPairComponent } from './minus-liquidity-pair.component';

describe('MinusLiquidityPairComponent', () => {
  let component: MinusLiquidityPairComponent;
  let fixture: ComponentFixture<MinusLiquidityPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MinusLiquidityPairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MinusLiquidityPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
