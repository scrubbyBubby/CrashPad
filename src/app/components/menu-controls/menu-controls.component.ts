import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { CcViewService } from '../../services/cc-view/cc-view.service';
import { ChecklistOverlayService } from '../../services/checklist-overlay/checklist-overlay.service';
import { ContainerService } from '../../services/container/container.service';
import { ElementService } from '../../services/element/element.service';
import { PadManagerService } from '../../services/pad-manager/pad-manager.service';

interface MenuItem {
  text: string,
  action: Function,
}

@Component({
  selector: 'app-menu-controls',
  templateUrl: './menu-controls.component.html',
  styleUrls: ['./menu-controls.component.sass']
})
export class MenuControlsComponent implements OnInit {

  constructor(
    public elementService: ElementService,
    public checklistOverlayService: ChecklistOverlayService,
    public containerService: ContainerService,
    public padManager: PadManagerService,
    public ccView: CcViewService,
  ) { }

  ngOnInit(): void {
  }

  public controlOpen: boolean;

  public overlayOpen: boolean;
  public overlayExpanded: boolean = false;

  private overlayTimeoutID: number;

  toggleOverlay(): void {
    this.overlayOpen = this.checklistOverlayService.setOpen();
    if (!this.overlayOpen && this.overlayTimeoutID === undefined) {
      this.overlayTimeoutID = setTimeout(() => {
        this.setExpanded(false);
        this.overlayTimeoutID = undefined;
      },500)
    } else if (this.overlayTimeoutID != undefined) {
      clearTimeout(this.overlayTimeoutID);
      this.overlayTimeoutID = undefined;
    }
  }

  public menuItems: Array<MenuItem> = [
    {
      text: `Templates`,
      action: () => {
        this.elementService.enableMode('manager',true);
      },
    },{
      text: `Themes`,
      action: () => {
        this.elementService.enableMode('themeManager',true);
      },
    },{
      text: "Welcome",
      action: () => {
        this.elementService.displayWelcome();
      },
    },{
      text: "Feedback",
      action: () => {
        this.openLink('feedback');
      },
    },{
      text: "Report Bugs",
      action: () => {
        this.openLink('bugReport');
      },
    },{
      text: "Reset",
      action: () => {
        this.elementService.wipeData();
      },
    },
  ]

  executeAction(item: MenuItem): void {
    item.action();
  }

  setMainMenu(state?:boolean): void {
    this.containerService.setMainMenu(state);
  }

  closeControl(): void {
    return;
    this.controlOpen = false;
  }

  private links = {
    'feedback': 'https://docs.google.com/forms/d/e/1FAIpQLSf_Oxrh3GePdeNkFiXnHgeDum4YzoVUSNYIUbI73mh4lNs8LQ/viewform?usp=sf_link',
    'bugReport': 'https://docs.google.com/forms/d/e/1FAIpQLScRLdjr1bBiGORkUp-LKrMsfgiiuyJOf8YAgg-lBKMayGakig/viewform?usp=sf_link',
  }

  openLink(linkNickname: string): void {
    const link = this.links[linkNickname];
    if (link != undefined) {
      window.open(link);
    } else {
      throw new Error(`There is no link with nickname ${linkNickname}`);
    }
  }

  public overlayHeader: string;

  setExpanded(value?: boolean): void {
    console.log(`Setting expanded to ${value}`);
    if (this.checklistOverlayService.overlayUI === undefined) {
      return;
    }
    console.log(`Setting expansion with value ${value}`);
    this.overlayExpanded = this.checklistOverlayService.setExpanded(value);
    console.log(`expanded is ${this.overlayExpanded || false}`);
    if (this.overlayExpanded) {
      document.getElementById(`new-checklist-overlay-content`).style.maxHeight = '3000px';
      console.log(`Height is unset`);
    } else {
      this.checklistOverlayService.newExpand();
      console.log(`Height is restricted`);
    }
  }

  checkModeSwitch(event) {
    const element = event.currentTarget;
    const scrollLeft = element.scrollLeft;
    const totalScroll = element.scrollWidth - element.offsetWidth;
    const percentScrolled: number = Math.floor(scrollLeft * 100 / totalScroll);
    if (percentScrolled > 0 && percentScrolled < 100) {
      return;
    }
    if (this.elementService.mode === 'utilize' && percentScrolled === 100) {
      this.elementService.setMode('customize');
    } else if(this.elementService.mode === 'customize' && percentScrolled === 0) {
      this.elementService.setMode('utilize');
    }
  }

  setMode(mode: string) {
    const scrollElement = document.getElementById('customize-utilize-scroll-switch');

    const protocols = {
      'utilize': () => {
        console.log(`Setting scrollLeft to 0`);
        scrollElement.scrollLeft = 0;
      },
      'customize': () => {
        console.log(`ScrollWidth is ${scrollElement.scrollWidth} and offsetWidth is ${scrollElement.offsetWidth}`);
        const maxScroll: number = scrollElement.scrollWidth;
        console.log(`Setting scrollLeft to ${maxScroll}`);
        scrollElement.scrollLeft = maxScroll;
      },
    }

    console.log(`Setting mode to ${mode}`);
    if (mode === 'utilize' || mode === 'customize') {
      protocols[mode]();
    }
  }

  public slideDragPosition = {
    x: 0, 
    y: 0,
    z: 0,
  }

  dragEnd(event: CdkDragEnd): void {
    const boxElement = document.getElementById('mobile-customize-utilize-box');
    const slideElement = document.getElementById('mobile-customize-utilize-slide');

    const boxWidth = boxElement.offsetWidth;
    const boxCenter = Math.floor(boxWidth * 0.5);

    const slideWidth = slideElement.offsetWidth;
    const slideCenter = this.slideDragPosition.x + Math.floor(slideWidth * 0.5);
    const slideMax = boxWidth - slideWidth;

    const newMode = (slideCenter >= boxCenter) ? 'customize' : 'utilize';

    console.log(`X position on end ${this.slideDragPosition.x}`);

    this.slideDragPosition.x = (newMode === 'customize') ? slideMax : 0;
    this.slideDragPosition = Object.assign({}, this.slideDragPosition);

    console.log(`X position was set to ${this.slideDragPosition.x}`);
  }

  menuDragEnd(event: CdkDragEnd): void {
    const boxElement = document.getElementById('mobile-customize-utilize-box');
    const slideElement = document.getElementById('mobile-customize-utilize-slide');
    
    const transformString = slideElement.style.transform;
    console.log(`Transform string is ${transformString}`)
    const translate3dRegEx = /translate3d\((\d+)px, (\d+)px, (\d+)px\)/;
    const translateArray = translate3dRegEx.exec(transformString) || [];
    const translateObject = {
      x: Number(translateArray[1] || '0'),
      y: Number(translateArray[2] || '0'),
      z: Number(translateArray[3] || '0'),
    };

    console.log(`Translate on dragEnd is X: ${translateObject.x} Y: ${translateObject.y} Z: ${translateObject.z}`);

    const boxWidth = boxElement.offsetWidth;
    const boxCenter = Math.floor(boxWidth * 0.5);

    console.log(`Box Width: ${boxWidth} | Box Center: ${boxCenter}`);

    const slideWidth = slideElement.offsetWidth;
    const slideCenter = translateObject.x + Math.floor(slideWidth * 0.5);
    const slideMax = boxWidth - slideWidth;

    console.log(`Slide Width: ${slideWidth} | Slide Center: ${slideCenter}`);

    const newMode = (slideCenter >= boxCenter) ? 'customize' : 'utilize';
    this.setSlideChoice(newMode, slideMax);

    const neuterTransition = function(slideElement) {
      return () => {
        slideElement.style.transition = "unset";
      }
    }(slideElement);
    setTimeout(neuterTransition, 200);
  }

  setSlideChoice(choice: string, slideMax?: number): void {
    const slideElement = document.getElementById('mobile-customize-utilize-slide');
    if (slideMax === undefined) {
      const boxElement = document.getElementById('mobile-customize-utilize-box');
      const boxWidth = boxElement.offsetWidth;
      const slideWidth = slideElement.offsetWidth;
      slideMax = boxWidth - slideWidth;
    }
    if (choice != 'customize' && choice != 'utilize') {
      throw new Error(`Can only set slide choice to "utilize" or "customize", not ${choice}`);
    };
    slideElement.style.transition = "all 200ms ease-in-out";
    this.slideDragPosition.x = (choice === 'customize') ? slideMax : 0;
    this.slideDragPosition = Object.assign({}, this.slideDragPosition);

    const neuterTransition = function(slideElement) {
      return () => {
        slideElement.style.transition = "unset";
      }
    }(slideElement);
    setTimeout(neuterTransition, 200);

    this.elementService.setMode(choice);
    this.displayMode = choice;
    const closeMenu = function(self) {
      return () => {
        self.containerService.setMainMenu();
        self.containerService.holdHoveredElement()
      }
    }(this);
    setTimeout(closeMenu, 350);
  }

  neuterTransition(): void {
    console.log(`Neutering transition`);
    const slideElement = document.getElementById('mobile-customize-utilize-slide');
    slideElement.style.transition = "unset";
  }

  public displayMode: string = 'utilize';

  public loopEngineInt: number;

  modeLoopEngine(turnOn: boolean = true) {
    const protocols = {
      'turnOn': () => {
        const checkPosition = function(self) {
          return () => {
            const boxElement = document.getElementById('mobile-customize-utilize-box');
            const slideElement = document.getElementById('mobile-customize-utilize-slide');
            
            const transformString = slideElement.style.transform;
            console.log(`Transform string is ${transformString}`)
            const translate3dRegEx = /translate3d\((\d+)px, (\d+)px, (\d+)px\)/;
            const translateArray = translate3dRegEx.exec(transformString) || [];
            const translateObject = {
              x: Number(translateArray[1] || '0'),
              y: Number(translateArray[2] || '0'),
              z: Number(translateArray[3] || '0'),
            };
      
            console.log(`Translate on dragEnd is X: ${translateObject.x} Y: ${translateObject.y} Z: ${translateObject.z}`);
      
            const boxWidth = boxElement.offsetWidth;
            const boxCenter = Math.floor(boxWidth * 0.5);
      
            console.log(`Box Width: ${boxWidth} | Box Center: ${boxCenter}`);
      
            const slideWidth = slideElement.offsetWidth;
            const slideCenter = translateObject.x + Math.floor(slideWidth * 0.5);
            const slideMax = boxWidth - slideWidth;
      
            self.displayMode = (slideCenter >= boxCenter) ? 'customize' : 'utilize';
          }
        }(this);
    
        const int: number = setInterval(checkPosition, 30);
        this.loopEngineInt = int;
      },
      'turnOff': () => {
        clearInterval(this.loopEngineInt);
      },
    }

    const protocol: string = (turnOn) ? 'turnOn' : 'turnOff';
    protocols[protocol]();
  }
}
