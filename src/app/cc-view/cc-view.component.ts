import { Component, OnInit } from '@angular/core';
import { AlertOverlayService } from '../alert-overlay.service';
import { CcViewService } from '../cc-view.service';
import { ElementService } from '../element.service';

@Component({
  selector: 'app-cc-view',
  templateUrl: './cc-view.component.html',
  styleUrls: ['./cc-view.component.sass']
})
export class CcViewComponent implements OnInit {

  public dropDownOpen: boolean = false;
  public dropDownChoice: string;

  public hovering = {};

  public fontChoices = [
    '12px',
    '14px',
    '16px',
    '20px',
    '24px',
    '30px',
    '36px',
  ];

  public fontStyles = [
    'bold',
    'normal',
    'italic',
  ]

  public borderWidths = [
    '0px',
    '1px',
    '2px',
    '3px',
    '4px',
    '5px',
    '6px',
    '7px',
    '8px',
  ]

  public borderStyles = [
    'solid',
    'double',
    'dashed',
    'dotted',
    'ridge',
    'groove',
    'outset',
  ]

  public borderRadii = [
    '0px',
    '5px',
    '10px',
    '15px',
    '20px',
    '25px',
    '30px',
  ]

  public shadowSpreads = [
    '0px',
    '1px',
    '2px',
    '3px',
    '4px',
    '5px',
    '6px',
    '8px',
    '10px',
    '14px',
    '20px',
  ]

  public shadowBlurs = [
    '0px',
    '1px',
    '2px',
    '3px',
    '4px',
    '5px',
    '6px',
    '8px',
    '10px',
    '14px',
    '20px',
  ]

  public shadowOffsets = [
    '-5px',
    '-4px',
    '-3px',
    '-2px',
    '-1px',
    '0px',
    '1px',
    '2px',
    '3px',
    '4px',
    '5px',
  ];

  public shadowInsets = [
    'inset',
    'offset',
  ]

  public listItemSizes = [
    'small',
    'medium',
    'large',
    'x-large',
  ]

  public checkboxIcons = [
    'X',
    '&#10003;',
  ]

  public openDD = {
  };

  private untouchedOpenDD;

  constructor(
    public ccView: CcViewService,
    public elementService: ElementService,
  ) {
    this.untouchedOpenDD = Object.assign({}, this.openDD);
    this.ccView.checkMobile();
    window.onresize = () => {
      this.ccView.checkMobile();
    }
  }

  ngOnInit(): void {
  }

  setHovering(tagName: string, state: boolean) {
    this.hovering[tagName] = state;
  }

  closeOtherDropDowns(open?: string): void {
    console.log(`Open is ${open}`);
    const newOpenDD = Object.assign({}, this.untouchedOpenDD);
    newOpenDD[open] = true;
    this.openDD = newOpenDD;
    console.log(`New OpenDD is ${JSON.stringify(newOpenDD)}`);
  }
}
