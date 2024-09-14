import { TestBed } from '@angular/core/testing';

import { AutomationServiceService } from './automation-service.service';

describe('AutomationServiceService', () => {
  let service: AutomationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutomationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
