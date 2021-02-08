import { TestBed } from '@angular/core/testing';

import { KeeperService } from './keeper.service';

describe('KeeperService', () => {
  let service: KeeperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeeperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
