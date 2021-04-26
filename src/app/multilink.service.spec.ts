import { TestBed } from '@angular/core/testing';

import { MultilinkService } from './multilink.service';

describe('MultilinkService', () => {
  let service: MultilinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultilinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
