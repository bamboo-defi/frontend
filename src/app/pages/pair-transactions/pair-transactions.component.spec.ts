import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PairTransactionsComponent } from './pair-transactions.component';

describe('PairTransactionsComponent', () => {
  let component: PairTransactionsComponent;
  let fixture: ComponentFixture<PairTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PairTransactionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PairTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
