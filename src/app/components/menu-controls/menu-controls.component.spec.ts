import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuControlsComponent } from './menu-controls.component';

describe('MenuControlsComponent', () => {
  let component: MenuControlsComponent;
  let fixture: ComponentFixture<MenuControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
