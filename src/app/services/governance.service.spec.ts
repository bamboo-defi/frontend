import { TestBed } from '@angular/core/testing';

import { GovernanceService } from './governance.service';

describe('GovernanceService', () => {
  let service: GovernanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GovernanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
