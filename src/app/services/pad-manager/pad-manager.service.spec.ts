import { TestBed } from '@angular/core/testing';

import { PadManagerService } from './pad-manager.service';

describe('PadManagerService', () => {
  let service: PadManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PadManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
