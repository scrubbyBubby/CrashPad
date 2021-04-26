import { Component, OnInit, Input } from '@angular/core';
import { CcViewService } from '../cc-view.service';
import { ElementService } from '../element.service';
import { LinkService } from '../link.service';
import { MultilinkService } from '../multilink.service';

interface contentInfo {
  text: string,
  link: string,
}

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.sass']
})
export class LinkComponent implements OnInit {
  @Input() uid: string;
  @Input() draggable: boolean = false;
  @Input() containerUID: string;
  @Input() preview: boolean = false;
  @Input() mode: string;
  @Input() customContent;
  
  public showControls: boolean = true;

  public info: any;

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
    public service: LinkService,
    public multilinkService: MultilinkService,
  ) {
  }

  ngOnInit(): void {
    let element = this.elementService.elements[this.uid];
    if (element === undefined) {
      this.elementService.createNewElement(this.uid,'link');
    }

    this.elementService.initializeElement(this.uid);
    if (this.elementService.elements[this.uid].customization['content:text'] === undefined) {
      this.elementService.elements[this.uid].customization['content:text'] = this.elementService.elements[this.uid].customization['content:title'];
      delete this.elementService.elements[this.uid].customization['content:title'];
      const customization = JSON.parse(JSON.stringify(this.elementService.elements[this.uid].customization));
      this.elementService.fullParse(this.uid, customization, true);
    }
  }

  getCustomContent() {
    return Object.assign({},this.elementService.elements[this.uid].content,this.customContent);
  }

  openLinks(): void {
    this.multilinkService.openLinks(this.uid);
  }

  postText(): void {
    const text: string = document.getElementById(`${this.uid}-text`).innerText;
    if (this.ccView.ccViewUI) {
      this.ccView.forms.convertedCustomization.patchValue({
        'content:text': text,
      })
    } else {
      this.service.postText(this.uid,text);
    }
  }

  revealControls(state?: boolean): void {
    state = (state === undefined) ? !this.showControls : state;
    this.showControls = state;
    console.log(`After setting state ${state} showControls are ${this.showControls}`);
  }
  
  selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}