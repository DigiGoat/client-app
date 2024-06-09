import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { repoGuard } from './repo.guard';

describe('repoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => repoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
