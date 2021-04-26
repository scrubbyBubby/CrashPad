import { Injectable } from '@angular/core';
import { ElementService } from './element.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    private elementService: ElementService,
  ) { }

  private templateStylingConversionReference = {
  }
}
