import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMarketComponent } from './global-market.component';

describe('GlobalMarketComponent', () => {
  let component: GlobalMarketComponent;
  let fixture: ComponentFixture<GlobalMarketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalMarketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
