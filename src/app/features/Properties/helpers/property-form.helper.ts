export class PropertyFormHelper {
  static toggleFacility(list: number[], id: number): number[] {
    return list.includes(id)
      ? list.filter((x) => x !== id)
      : [...list, id];
  }

  static buildFormData(v: any, facilities: number[], images: File[]) {
    const formData = new FormData();

    formData.append('Name', v.name);
    formData.append('Description', v.description);
    formData.append('OwnerPhoneNumber', v.ownerPhoneNumber);
    formData.append('OwnerPassword', v.ownerPassword);
    formData.append('PropertyType', v.propertyType);
    formData.append('Address', v.address);
    formData.append('Location', v.location);

    formData.append('PricePerNight', v.pricePerNight.toString());
    formData.append('PricePerHour', v.pricePerHour.toString());
    formData.append('RoomCount', v.roomCount.toString());
    formData.append('GuestCount', v.guestCount.toString());

    facilities.forEach((id) =>
      formData.append('FacilityIds', id.toString())
    );

    images.forEach((file) =>
      formData.append('Images', file)
    );

    return formData;
  }
}
