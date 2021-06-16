import { TestBed } from '@angular/core/testing';

import { ChecklistOverlayService } from './checklist-overlay.service';

describe('ChecklistOverlayService', () => {
  let service: ChecklistOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
