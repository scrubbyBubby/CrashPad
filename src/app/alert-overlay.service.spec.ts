import { TestBed } from '@angular/core/testing';

import { AlertOverlayService } from './alert-overlay.service';

describe('AlertOverlayService', () => {
  let service: AlertOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
