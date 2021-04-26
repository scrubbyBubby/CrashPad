import { Component, OnInit } from '@angular/core';

import { AlertOverlayService } from '../alert-overlay.service';

@Component({
  selector: 'app-alert-overlay',
  templateUrl: './alert-overlay.component.html',
  styleUrls: ['./alert-overlay.component.sass']
})
export class AlertOverlayComponent implements OnInit {

  constructor(
    public service: AlertOverlayService,
  ) { }

  ngOnInit(): void {
    this.service.slide(false);
    const element = document.getElementById(`alert-overlay-sub-wrapper`);
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transition = `top ${this.service.slideTiming}ms ${this.service.slideTimingFunction}`;
      this.service.slide(false);
    },10)
  }
  
}
