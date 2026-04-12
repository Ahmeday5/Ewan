import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyBookingsComponent } from './property-bookings.component';

describe('PropertyBookingsComponent', () => {
  let component: PropertyBookingsComponent;
  let fixture: ComponentFixture<PropertyBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
