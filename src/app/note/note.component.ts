import { CcViewService } from '../cc-view.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ElementService } from '../element.service';
import { NoteService } from '../note.service';

document.addEventListener('input', function (event) {
	if (event.target['tagName'].toLowerCase() !== 'textarea') return;
	autoExpand(event.target);
}, false);

const autoExpand = function (field) {
	field.style.height = 'inherit';
	var computed = window.getComputedStyle(field);
	var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
	             + parseInt(computed.getPropertyValue('padding-top'), 10)
	             + field.scrollHeight
	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

	field.style.height = height + 'px';
};

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.sass']
})
export class NoteComponent implements OnInit {
  @Input() uid: string;
  @Input() draggable: boolean = true;
  @Input() containerUID: string;
  @Input() customStyling;
  @Input() preview: boolean = false;
  @Input() mode: string;

  public showControls: boolean = true;

  public info: any;

  public editingLocked: boolean = false;

  public forms = {
    note: this.fb.group({
      text: [''],
    })
  }

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
    public noteService: NoteService,
    public fb: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    let element = this.elementService.elements[this.uid];
    if (element === undefined) {
      this.elementService.createNewElement(this.uid,'note');
    }

    this.elementService.initializeElement(this.uid);

    const text: string = element.content.text.trim();
    this.forms.note.patchValue({'text':text});
  }
  
  lockEditing(state?: boolean,): void {
    const protocol: string = (state === undefined) ? 'toggle' : 'set';
    const protocols = {
      'set': () => {
        this.editingLocked = state;
      },
      'toggle': () => {
        this.editingLocked = !this.editingLocked;
      },
    };

    protocols[protocol]();
  }

  postText(): void {
    const text: string = document.getElementById(`${this.uid}-text`).innerText.trim();
    if (this.ccView.ccViewUI) {
      this.ccView.forms.convertedCustomization.patchValue({
        'content:text': text,
      })
    } else {
      this.elementService.elements[this.uid].content.text = text;
      this.forms.note.patchValue({'text': text});
      this.elementService.saveElements();
    }
  }

  revealControls(state?: boolean): void {
    state = (state === undefined) ? !this.showControls : state;
    this.showControls = state;
    console.log(`After setting state ${state} showControls are ${this.showControls}`);
  }
}
