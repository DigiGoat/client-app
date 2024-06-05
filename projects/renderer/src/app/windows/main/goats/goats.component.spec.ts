import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoatsComponent } from './goats.component';

describe('GoatsComponent', () => {
  let component: GoatsComponent;
  let fixture: ComponentFixture<GoatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GoatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
