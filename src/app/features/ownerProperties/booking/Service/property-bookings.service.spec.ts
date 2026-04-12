import { TestBed } from '@angular/core/testing';

import { PropertyBookingsService } from './property-bookings.service';

describe('PropertyBookingsService', () => {
  let service: PropertyBookingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyBookingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
