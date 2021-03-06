/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FlexInputComponent } from './flex-input.component';

describe('FlexInputComponent', () => {
  let component: FlexInputComponent;
  let fixture: ComponentFixture<FlexInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
