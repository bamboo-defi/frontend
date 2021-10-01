import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenulinksComponent } from './menulinks.component';

describe('MenulinksComponent', () => {
  let component: MenulinksComponent;
  let fixture: ComponentFixture<MenulinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenulinksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenulinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
