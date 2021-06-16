import { TestBed } from '@angular/core/testing';

import { FlowControlService } from './flow-control.service';

describe('FlowControlService', () => {
  let service: FlowControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlowControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
