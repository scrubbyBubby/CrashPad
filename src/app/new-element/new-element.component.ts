import { Component, OnInit, Input } from '@angular/core';
import { ElementService } from '../element.service';
import { CcViewService } from '../cc-view.service';
import { ToolTipService } from '../tool-tip.service';

@Component({
  selector: 'app-new-element',
  templateUrl: './new-element.component.html',
  styleUrls: ['./new-element.component.sass']
})
export class NewElementComponent implements OnInit {
  @Input() uid: string;
  @Input() containerUID: string;
  @Input() draggable: boolean = true;
  @Input() mainView: boolean = false;
  @Input() mainStyling = {};
  @Input() preview: boolean = false;
  @Input() mode: string;
  @Input() overlay: boolean = false;
  @Input() mainPad: boolean = false;
  @Input() showControls: boolean = true;
  @Input() hideExternal: boolean = true;

  public iconBarInvisible: boolean = true;
  public iconBarText: string;

  public toolTips = {
    'add': 'add element',
    'customize': 'customize',
    'delete': 'delete element',
  }

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
    public toolTipService: ToolTipService,
  ) { }

  ngOnInit(): void {
  }

  getCustomStyling() {
    const mainStyling = this.elementService.elements[this.uid].parsedCustomization['main'];
    const customStyling = this.ccView.getCustomStyling(this.uid,mainStyling,this.overlay);
    return customStyling;
  }

  setIconBarText(text: string): void {
    if (this.mainView && text === 'delete') {
      return;
    }

    this.iconBarText = text;
  }
}
