import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolTipService {

  public locationStyling = {};

  public toolTipUID: string = undefined;

  public text: string = undefined;

  private toolTipDelay: number = 200;
  private toolTipTimeout: number = undefined;

  public toolTipBoxID: string = 'tool-tip-box';

  private closeToolTipTimeout: number = undefined;
  public cannotCancelToolTip: boolean = false;
  public cannotCancelToolTipClose: boolean = false;
  public above: boolean = false;
  public xOffset: number = 0;
  public xOffsetStyling = {
    transform: `translate3d(0px, 0px, 0px)`,
  };

  constructor() { }

  openToolTip(text: string, toolTipUID: string, elementRef, above: boolean = false, leftShift: number = 0, toolTipDelay?: number) {
    console.log(`Opening tool tip ${above ? "above" : "below"}.`);
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    //const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    if (vw <= 700) {return};
    toolTipDelay = (toolTipDelay === undefined) ? this.toolTipDelay : toolTipDelay;
    console.log(`Opening tool tip with ${toolTipDelay}ms delay.`);

    if (this.toolTipTimeout != undefined && !this.cannotCancelToolTip) {
      clearTimeout(this.toolTipTimeout);
    }
    if (this.closeToolTipTimeout != undefined && !this.cannotCancelToolTipClose) {
      clearTimeout(this.closeToolTipTimeout);
    }

    const displayToolTip = function(self, toolTipUID: string, event, above: boolean) {
      return () => {
        self.cannotCancelToolTip = true;
        self.toolTipUID = toolTipUID;
        self.xOffset = leftShift;
        self.xOffsetStyling = {
          transform: `translate3d(${leftShift}px, 0px, 0px)`,
        }
        const targetElement = elementRef;
        const halfTargetWidth = Math.floor(targetElement.offsetWidth * 0.5);
        const targetRect = targetElement.getBoundingClientRect();
        const toolTipElement = document.getElementById(self.toolTipBoxID);
        const halfWidth = Math.floor(toolTipElement.offsetWidth * 0.5);
        const rawY = targetRect.top;
        const targetHeight = targetElement.offsetHeight;
        const finalY = (above) ? rawY - targetHeight - 8 : rawY + targetHeight + 10;
        const rawX = targetRect.left;
        let finalX = rawX - halfWidth + halfTargetWidth;
        finalX = (finalX < 0) ? 0 : finalX;
        self.text = text;
        self.above = above;
        self.locationStyling = {
          transform: `translate3d(${finalX}px, ${finalY}px, 0px)`,
          opacity: '1',
        }
        console.log(`rawY: ${rawY} | targetHeight: ${targetHeight} | finalY: ${finalY} | rawX: ${rawX} | halfWidth: ${halfWidth} | finalX: ${finalX}`);
        console.log(`Transform: translate3d(${finalX}px, ${finalY}px, 0px)`);
        self.toolTipTimeout = undefined;
        self.cannotCancelToolTip = false;
      }
    }(this, toolTipUID, elementRef, above);

    this.toolTipTimeout = setTimeout(() => {
      displayToolTip();
    }, toolTipDelay);
  }

  closeToolTip(delay: number = 200): void {
    console.log(`Closing tool tip with ${delay}ms delay.`);

    if (this.toolTipTimeout != undefined && !this.cannotCancelToolTip) {
      clearTimeout(this.toolTipTimeout);
    }
    if (this.closeToolTipTimeout != undefined && !this.cannotCancelToolTipClose) {
      clearTimeout(this.closeToolTipTimeout);
    }

    const closeEverything = function(self) {
      return () => {
        self.cannotCancelToolTipClose = true;
        self.locationStyling['opcaity'] = '0';
        self.text = undefined;
        self.toolTipUID = undefined;
        self.above = false;
        self.xOffset = 0;
        self.closeToolTipTimeout = undefined;
        self.cannotCancelToolTipClose = false;
      }
    }(this);

    this.locationStyling['opacity'] = '0';
    this.closeToolTipTimeout = setTimeout(() => {
      closeEverything();
    }, delay)

  }

  oldOpenToolTip(text: string, toolTipUID: string, event, above: boolean = false, toolTipDelay?: number) {
    console.log(`Opening tool tip ${above ? "above" : "below"}.`);
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    if (vw <= 700 && vh <= 600) {return};
    toolTipDelay = (toolTipDelay === undefined) ? this.toolTipDelay : toolTipDelay;
    console.log(`Opening tool tip with ${toolTipDelay}ms delay.`);

    if (this.toolTipTimeout != undefined && !this.cannotCancelToolTip) {
      clearTimeout(this.toolTipTimeout);
    }
    if (this.closeToolTipTimeout != undefined && !this.cannotCancelToolTipClose) {
      clearTimeout(this.closeToolTipTimeout);
    }

    const displayToolTip = function(self, toolTipUID: string, event, above: boolean) {
      return () => {
        self.cannotCancelToolTip = true;
        self.toolTipUID = toolTipUID;
        const targetElement = event.target;
        const halfTargetWidth = Math.floor(targetElement.offsetWidth * 0.5);
        const targetRect = targetElement.getBoundingClientRect();
        const toolTipElement = document.getElementById(self.toolTipBoxID);
        const halfWidth = Math.floor(toolTipElement.offsetWidth * 0.5);
        const rawY = window.event['clientY'];
        const targetHeight = targetElement.offsetHeight;
        const finalY = (above) ? rawY - targetHeight - 8 : rawY + targetHeight + 10;
        const rawX = window.event['clientX'];
        let finalX = rawX - halfWidth + halfTargetWidth;
        finalX = (finalX < 0) ? 0 : finalX;
        self.text = text;
        self.above = above;
        self.locationStyling = {
          transform: `translate3d(${finalX}px, ${finalY}px, 0px)`,
          opacity: '1',
        }
        console.log(`rawY: ${rawY} | targetHeight: ${targetHeight} | finalY: ${finalY} | rawX: ${rawX} | halfWidth: ${halfWidth} | finalX: ${finalX}`);
        console.log(`Transform: translate3d(${finalX}px, ${finalY}px, 0px)`);
        self.toolTipTimeout = undefined;
        self.cannotCancelToolTip = false;
      }
    }(this, toolTipUID, event, above);

    this.toolTipTimeout = setTimeout(() => {
      displayToolTip();
    }, toolTipDelay);
  }
}
