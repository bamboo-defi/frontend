import { TestBed } from '@angular/core/testing';

import { RaindropService } from './raindrop.service';

describe('RaindropService', () => {
  let service: RaindropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaindropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
