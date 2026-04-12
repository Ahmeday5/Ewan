import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PropertyTypeEnum } from '../enums/property-type.enum';

@Injectable({
  providedIn: 'root',
})
export class PropertyFormService {
  constructor(private fb: FormBuilder) {}

  createForm() {
    return this.fb.group({
      id: [null],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      ownerPhoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^01[0-2,5]{1}[0-9]{8}$/)],
      ],
      ownerPassword: ['', [Validators.required, Validators.minLength(6)]],
      propertyType: [null, Validators.required],
      isAvailable: [true],
      address: ['', [Validators.required, Validators.minLength(5)]],
      location: ['', [Validators.required, Validators.minLength(5)]],
      pricePerNight: [0, [Validators.required]],
      pricePerHour: [0, [Validators.required]],
      roomCount: [0, [Validators.required]],
      guestCount: [0, [Validators.required]],
    });
  }

  isHall(type: PropertyTypeEnum) {
    return type === PropertyTypeEnum.Hall;
  }

  isNormal(type: PropertyTypeEnum) {
    return (
      type === PropertyTypeEnum.Chalet ||
      type === PropertyTypeEnum.Hotel ||
      type === PropertyTypeEnum.Apartment
    );
  }
}
