import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenvalueComponent } from './tokenvalue.component';

describe('TokenvalueComponent', () => {
  let component: TokenvalueComponent;
  let fixture: ComponentFixture<TokenvalueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenvalueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenvalueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
