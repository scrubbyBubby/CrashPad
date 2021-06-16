import { Injectable } from '@angular/core';

interface Alert {
  message: string,
  duration?: number,
  requireClick?: boolean,
}

@Injectable({
  providedIn: 'root'
})
export class AlertOverlayService {
  public message: string;
  private active: boolean = false;
  public alertList: Array<Alert> = [];
  public textAlertList: Array<string> = [];
  public repeatCounts = {};
  public open: boolean = false;
  private alertDuration: number = 5000;

  private timeouts = {};
  public countdown: number;
  
  public slideTiming: number = 300;
  public slideTimingFunction: string = `ease-out`;

  public fading = {};
  public fadeDuration: number = 600;

  constructor() { }

  newAlert(alert: Alert): void {
    const message: string = alert.message;
    const index: number = this.textAlertList.indexOf(message);
    const messageExistsAlready: boolean = (index != -1) ? true : false;

    const addAlertToListAndClearTimeout = () => {
      const protocols = {
        'existingMessage': () => {
          this.repeatCounts[message] = (this.repeatCounts[message] || 1) + 1;
          this.alertList.push(this.alertList.splice(index,1)[0]);
          this.textAlertList.push(this.textAlertList.splice(index,1)[0]);
          clearTimeout(this.timeouts[`remove${message}`]);
        },
        'newMessage': () => {
          this.alertList.push(alert);
          this.textAlertList.push(message);
        },
      }

      const protocol: string = (messageExistsAlready) ? 'existingMessage' : 'newMessage';
      protocols[protocol]();
    }

    const activateAlertOverlay = () => {
      if (!this.active) {
        this.open = true;
        this.slide(true);
        this.timeouts['slideTimeout'] = setTimeout(() => {
          this.active = true;
          delete this.timeouts['slideTimeout'];
        },this.slideTiming)
      }
    }

    const setTimeoutToRemoveMessage = () => {
      let duration = alert.duration || this.alertDuration;
      this.timeouts[`remove${message}`] = setTimeout(() => {
        this.fading[message] = true;
        setTimeout(() => {
          this.alertList.splice(0,1);
          this.textAlertList.splice(0,1);
          delete this.fading[message];
          if (this.alertList.length === 0) {
            this.open = false;
            this.slide(false);
            this.active = false;
          }
        },this.fadeDuration)
        delete this.timeouts[`remove${message}`];
      },duration)
    }

    addAlertToListAndClearTimeout();
    activateAlertOverlay();
    setTimeoutToRemoveMessage();
  }

  slide(down: boolean): void {
    const element = document.getElementById(`alert-overlay-sub-wrapper`);
    const elementExists: boolean = (element === null || element === undefined) ? true : false;

    if (!elementExists || this.open === down) {return};

    const newStyleTop: string = (down) ? `-${element.scrollHeight}px` : '0';
    element.style.top = newStyleTop;
  }
}
