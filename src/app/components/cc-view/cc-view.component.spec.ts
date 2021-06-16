import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CcViewComponent } from './cc-view.component';

describe('CcViewComponent', () => {
  let component: CcViewComponent;
  let fixture: ComponentFixture<CcViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CcViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CcViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
