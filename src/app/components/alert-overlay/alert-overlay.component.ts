import { Component, OnInit } from '@angular/core';

import { AlertOverlayService } from '../../services/alert-overlay/alert-overlay.service';

@Component({
  selector: 'app-alert-overlay',
  templateUrl: './alert-overlay.component.html',
  styleUrls: ['./alert-overlay.component.sass']
})
export class AlertOverlayComponent {
  constructor(
    public service: AlertOverlayService,
  ) {};
  
  componentDidMount(): void {
    const element = document.getElementById(`alert-overlay-sub-wrapper`);
    element.style.opacity = '1';
    element.style.transition = `top ${this.service.slideTiming}ms ${this.service.slideTimingFunction}`;
    this.service.slide(false);
  };
}
