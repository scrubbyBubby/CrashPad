import { Component } from '@angular/core';
import {Location, LocationStrategy, HashLocationStrategy} from '@angular/common';

document.addEventListener('mousedown', function (event) {
  if (event.detail > 1) {
    event.preventDefault();
    // of course, you still do not know what you prevent here...
    // You could also check event.ctrlKey/event.shiftKey/event.altKey
    // to not prevent something useful.
  }
}, false);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [
    Location, {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]
})
export class AppComponent {
  location: Location;
  constructor(location: Location) { this.location = location; }
  title = 'crash-pad';
}
