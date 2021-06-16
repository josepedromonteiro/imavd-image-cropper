import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAudioComponent } from './import-audio.component';

describe('ImportAudioComponent', () => {
  let component: ImportAudioComponent;
  let fixture: ComponentFixture<ImportAudioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportAudioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
