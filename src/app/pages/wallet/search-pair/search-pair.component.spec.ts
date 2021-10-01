import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchPairComponent } from './search-pair.component';

describe('SearchPairComponent', () => {
  let component: SearchPairComponent;
  let fixture: ComponentFixture<SearchPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchPairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
