import { Component, OnInit } from '@angular/core';
import { CcViewService } from '../../services/cc-view/cc-view.service';
import { ElementService } from '../../services/element/element.service';

@Component({
  selector: 'app-template-manager',
  templateUrl: './template-manager.component.html',
  styleUrls: ['./template-manager.component.sass']
})
export class TemplateManagerComponent implements OnInit {

  public selectedOption: string = "(unset)";
  public lastSelectedOption: string = "(unset)";

  constructor(
    public elementService: ElementService,
    public ccView: CcViewService,
  ) { }

  ngOnInit(): void {
    this.selectedOption = "(unset)";
    this.lastSelectedOption = "(unset)";
  }

  log(string: string): void {
    console.log(string);
  }

  applyTheme(option: string) {
    if (this.elementService.currentTheme != option) {
      this.elementService.applyTheme(option);
    }
  }

  selectOption(option?: string) {
    this.lastSelectedOption = this.selectedOption;
    const protocols = {
      'set': () => {
        this.selectedOption = option;
      },
      'unset': () => {
        this.selectedOption = undefined;
      },
    };
    const protocol: string = (this.selectedOption === option) ? 'unset' : 'set';
    protocols[protocol]();

    console.log(`Selected option is ${this.selectedOption} and last selected option is ${this.lastSelectedOption}`);
  }

  chooseFirstTheme(choice: string): void {
    this.elementService.setFirstTime('themeChoice', false);
    this.elementService.applyTheme(choice, true, true);
    this.elementService.enableMain(false);
  }
}