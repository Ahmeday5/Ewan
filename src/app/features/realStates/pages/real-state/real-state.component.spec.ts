import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealStateComponent } from './real-state.component';

describe('RealStateComponent', () => {
  let component: RealStateComponent;
  let fixture: ComponentFixture<RealStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
