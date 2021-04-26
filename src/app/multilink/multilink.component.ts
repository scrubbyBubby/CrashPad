import { Component, OnInit, Input } from '@angular/core';
import { ElementService } from '../element.service';
import { CcViewService } from '../cc-view.service';
import { LinkService } from '../link.service';
import { MultilinkService } from '../multilink.service';

@Component({
  selector: 'app-multilink',
  templateUrl: './multilink.component.html',
  styleUrls: ['./multilink.component.sass']
})
export class MultilinkComponent implements OnInit {
  @Input() uid: string;
  @Input() parentUID: string;
  @Input() draggable: boolean = true;
  @Input() containerUID: string;
  @Input() preview: boolean = false;
  @Input() mode: string;
  @Input() customContent;

  public showControls: boolean = true;

  public info: any;

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
    public multilinkService: MultilinkService,
  ) {
  }

  ngOnInit(): void {
    let element = this.elementService.elements[this.uid];
    if (element === undefined) {
      this.elementService.createNewElement(this.uid,'multilink');
    }

    this.elementService.initializeElement(this.uid);
  }

  getCustomContent() {
    return Object.assign({},this.elementService.elements[this.uid].content,this.customContent);
  }

  postText(): void {
    const text: string = document.getElementById(`${this.uid}-text`).innerText;
    this.multilinkService.postText(this.uid,text);
  }

  revealControls(state?: boolean): void {
    state = (state === undefined) ? !this.showControls : state;
    this.showControls = state;
    console.log(`After setting state ${state} showControls are ${this.showControls}`);
  }
}
