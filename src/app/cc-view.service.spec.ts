import { TestBed } from '@angular/core/testing';

import { CcViewService } from './cc-view.service';

describe('CcViewService', () => {
  let service: CcViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
