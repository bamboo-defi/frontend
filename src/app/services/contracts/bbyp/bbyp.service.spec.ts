import { TestBed } from '@angular/core/testing';

import { BbypService } from './bbyp.service';

describe('BbypService', () => {
  let service: BbypService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbypService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
