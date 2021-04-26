import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilinkComponent } from './multilink.component';

describe('MultilinkComponent', () => {
  let component: MultilinkComponent;
  let fixture: ComponentFixture<MultilinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultilinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
