import { ElementRef, Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { FormBuilder } from '@angular/forms';
import { UtilityService } from './utility.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { PadManagerService } from './pad-manager.service';
import { Observable } from 'rxjs';

interface ElementInfo {
  uid: string,
  customization: object,
  customizationBackup: object,
  elementType: string,
  defaultTemplate: boolean,
  templateOverride: boolean,
  parsedCustomization?: object,
  template?: string,
  overrides?: object,
  disabled?: object,
  hightlight?: boolean,
}

interface TemplateInfo {
  templateName: string,
  ui: string,
  styling: object,
  disabled: object,
  stylingBackup?: object,
}

interface ThemeInfo {
  themeName: string,
  ui: string,
  stylingTemplates: object,
  disabledTypes: object,
  stylingBackups?: object,
}

interface DefaultInfo {
  customization: Object,
}

interface ElementTypeInfo {
  typeName: string,
  defaultInfo: DefaultInfo,
}

interface ViewObj {
  manager: boolean,
  themeManager: boolean,
  newTemplate: boolean,
  newElement: boolean,
  confirm: boolean,
  confirmWithOptions: boolean,
}

interface StylingInfo {
  'font:color': string,
  'font:size': string,
  'font:style': string,
  'font:family': string,
  'border:width': string,
  'border:color': string,
  'border:style': string,
  'border:radius': string,
  'background:color': string,
  'background:image': string,
  'shadow:inset': string,
  'shadow:xOffset': string,
  'shadow:yOffset': string,
  'shadow:color': string,
  'shadow:blur': string,
  'shadow:spread': string,
  'template:uid'?: string,
  'element:name'?: string,
}

interface StylingToggles {
  'font:color': boolean,
  'font:size': boolean,
  'font:style': boolean,
  'font:family': boolean,
  'border:width': boolean,
  'border:color': boolean,
  'border:style': boolean,
  'border:radius': boolean,
  'background:color': boolean,
  'background:image': boolean,
  'shadow:inset': boolean,
  'shadow:xOffset': boolean,
  'shadow:yOffset': boolean,
  'shadow:color': boolean,
  'shadow:blur': boolean,
  'shadow:spread': boolean,
  'template:uid'?: boolean,
  'element:name'?: boolean,
}

interface Projection {
  'customizationUI'?: string,
  'customization'?,
  'templateUI'?: string,
  'templateCustomization'?,
  'templateStrict'?: boolean,
  'themeUI'?: string,
  'themeCustomization'?,
  'themeOverride'?: boolean,
  'themeStrict'?: boolean,
  'overrides'?,
  'disabled'?,
}

interface NewProjection {
  'elementProjection': ElementDirectProjection | ElementReferenceProjection,
  'templateProjection': TemplateDirectProjection | TemplateReferenceProjection,
  'themeProjection': ThemeDirectProjection | ThemeReferenceProjection,
}

interface ElementDirectProjection {
  'customization',
  'overrides',
  'disabled',
}

interface ElementReferenceProjection {
  'ui': string,
}

interface TemplateDirectProjection {
  'ui': string,
  'styling',
  'strict': boolean,
  'disabled',
}

interface TemplateReferenceProjection {
  'ui': string,
  'strict': boolean,
}

interface ThemeDirectProjection {
  'ui': string,
  'stylingTemplates',
  'strict': boolean,
  'themeOverride': boolean,
  'disabled',
}

interface ThemeReferenceProjection {
  'ui': string,
  'strict': boolean,
  'themeOverride': boolean,
}

@Injectable({
  providedIn: 'root'
})
export class ElementService {
  public mode: string = 'utilize';

  public elements: object = {};

  public elementTypes: any = {};
  public elementTypeList: Array<string> = [
  ]

  public padElements: Array<string> = [
    'checklist',
    'link',
    'note',
  ];

  public padElementDescriptions = {
    'checklist': 'A list you can work on over time',
    'link': 'A link to a website',
    'multilink': 'Click to open multiple websites at once',
    'note': 'Write something down to remember later',
  }

  public templates: object = {};
  public templateList: Array<string> = [];
  public templateUIList: Array<string> = [];
  public themes: object = {};
  public themeList: Array<string> = [];
  public themeUIList: Array<string> = [];

  public templateState = {
    disabled: true,
  }

  public elementState = {
    disabled: true,
  }

  public forms = {
    newTemplateForm: this.fb.group({}),
    newTemplateFormList: [],
    newTemplateOverrides: {},
    newElementForm: this.fb.group({}),
    newElementFormList: [],
    textConfirmations: this.fb.group({}),
    managerSearch: this.fb.group({
      'template': [''],
      'theme': [''],
    }),
  }
  
  public view: ViewObj = {
    manager: false,
    themeManager: false,
    newTemplate: false,
    newElement: false,
    confirm: false,
    confirmWithOptions: false,
  }

  public viewOrder: Array<string> = [];
  public viewMode: string;

  public initialized: boolean = false;

  public usedNames: Array<string> = [];
  public usedThemeNames: Array<string> = [];
  
  private uidCharacterCount: number = 10;

  private newTemplateState: TemplateInfo;
  public newTemplateFormList: Array<string>;

  public newElementFormList: Array<string>;

  public confirmationMessage: string;
  public confirmationHeader: string;
  public confirmationList: Array<string>;
  public confirmations: object;
  public textConfirmationList: Array<string>;
  public textConfirmations: object;
  private confirmConfirmation: Function;
  private cancelConfirmation: Function;

  public currentTheme: string;
  public currentThemeStrict: boolean = false;

  public waitingElement: string;
  public waitingContainer: string;

  public confirmModeColumn: boolean = false;

  public firstTime = {
    themeChoice: false,
  }

  private backups;

  public templateDisplayList: Array<string>;
  public themeDisplayList: Array<string>;

  private defaults = {
    elements: {
      'masterContainer': {
        elementType: 'container',
        uid: 'masterContainer',
        customization: {
          'font:size': '30px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '3px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '15px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
        },
        content: {
          title: 'Brand New Launch Station',
          elementUIs: [
            'tutorialContainer',
          ],
          template: '',
          templateStrict: false,
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
      'tutorialContainer': {
        elementType: 'container',
        uid: 'tutorialContainer',
        top10Rank: 0,
        customization: {
          'font:size': '30px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '3px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '15px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
          'content:title': 'Tutorials',
          'content:elementUIs': [
            'tutorialChecklist'
          ],
          'content:theme': '',
          'content:themeStrict': false,
        },
        content: {
          title: 'Tutorials',
          elementUIs: [
            'tutorialChecklist',
          ],
          template: '',
          templateStrict: false,
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
      'firstContainer': {
        elementType: 'container',
        uid: 'firstContainer',
        customization: {
          'font:size': '30px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '3px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '15px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
        },
        content: {
          title: 'New Pad',
          elementUIs: [],
          template: '',
          templateStrict: false,
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
      'secondContainer': {
        elementType: 'container',
        uid: 'secondContainer',
        customization: {
          'font:size': '30px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '3px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '15px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
        },
        content: {
          title: 'New Pad',
          elementUIs: [],
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
      'thirdContainer': {
        elementType: 'container',
        uid: 'thirdContainer',
        customization: {
          'font:size': '30px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '3px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '15px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
        },
        content: {
          title: 'New Pad',
          elementUIs: [],
          template: '',
          templateStrict: false,
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
      'fourthContainer': {
        elementType: 'container',
        uid: 'fourthContainer',
        customization: {
          'font:size': '30px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '3px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '15px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
        },
        content: {
          title: 'New Pad',
          elementUIs: [],
          template: '',
          templateStrict: false,
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
      'tutorialChecklist': {
        elementType: 'checklist',
        uid: 'tutorialChecklist',
        customization: {
          'font:size': '20px',
          'font:family': 'Arial',
          'font:color': '#000000',
          'font:style': 'normal',
          'border:width': '2px',
          'border:style': 'solid',
          'border:color': '#CCCCCC',
          'border:radius': '0px',
          'background:color': '#FFFFFF',
          'background:image': '',
          'shadow:inset': 'outset',
          'shadow:xOffset': '0px',
          'shadow:yOffset': '0px',
          'shadow:color': '#FFFFFF',
          'shadow:blur': '0px',
          'shadow:spread': '0px',
          'checkbox:icon': 'X',
          'checkbox:color': '#000000',
          'listItems:size': 'medium',
          'listItems:fontColor': '#000000',
          'listItems:background': '#FFFFFF',
          'listItems:borderWidth': '1px',
          'listItems:borderStyle': 'solid',
          'listItems:borderColor': '#000000',
        },
        content: {
          title: "CrashPad Tutorial",
          itemList: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17'],
          itemObj: {
            '0': {
              text: `Put a pin in it`,
              note: `Click the "Pin Checklist" button at the top left of this element. You can do this on any checklist to "pin" it. At any time, you can click the button on the bottom right of the screen to see your pinned checklist.`,
              completed: false,
            },
            '1': {
              text: `Create a new Pad`,
              note: `Click the "+" button near the top right of the page, just under the main title.`,
              completed: false,
            },
            '2': {
              text: `Enable customization`,
              note: `Creating a Pad always puts you in "Customize" mode, but you can always click the "Main Menu" tab on the left and select "Customize" in the switch at the top. One way or another, get into "Customize" mode.`,
              completed: false,
            },
            '3': {
              text: `Give your Pad some style`,
              note: `Customization can be opened with the "Paintbrush" button near the top right of any element, although this button only appears in "Customize" mode.`,
              completed: false,
            },
            '4': {
              text: `Create your first element`,
              note: `While in "Customize" mode click the '+' button near the top right of any Pad. Then choose what kind of element to create.`,
              completed: false,
            },
            '5': {
              text: `Templates are dandy`,
              note: `Open the customization box of any element. At the bottom left of the customization box, click "Save As Template" to save this element's customization as a Template.`,
              completed: false,
            },
            '6': {
              text: `Two of a kind`,
              note: `Create a new element and open it's customization screen. Pick your newly created template out of the drop down at the top so that two elements now have the same template.`,
              completed: false,
            },
            '7': {
              text: `Synchronization complete`,
              note: `Click the "Main Menu" tab on the left and select "Templates" out of the list. Then click the pencil icon to the right of your desired template. Change a value and watch both elements change in sync.`,
              completed: false,
            },
            '8': {
              text: `Overriding current protocals`,
              note: `Open the customization screen of an element with a template on it. Select one of the styles that is set by the template and replace it with your own value. This sets an override so that no template or theme can change this value.`,
              completed: false,
            },
            '9': {
              text: `Visually distict`,
              note: `The visualization controls are in the top left of any customization box. Visualization is only a projection of how the changes in a customization box will affect elements. It doesn't actually change any elements.`,
              completed: false,
            },
            '10': {
              text: `Strictly speaking, the deal is off`,
              note: `The visualization controls allow you to set the visualization to Strict or Off. If neither box is checked, the visualization respects style overrides. When the visualization is Strict, style overrides are ignored. When the visualization is off, nothing is shown.`,
              completed: false,
            },
            '11': {
              text: `Revert to the norm`,
              note: `In any element customization screen, if a style is overriden it will have an "O" in the top right of that style box. Clicking this "O" will unset the override and revert the style back to the template value.`,
              completed: false,
            },
            '12': {
              text: `Create one of each element Type`,
              note: `Links connect to a webpage, Notes save text for you, and Checklists can be made and completed over time.`,
              completed: false,
            },
            '13': {
              text: `Building an army`,
              note: `We're gonna need more where we're going. Create 5 or 6 templates that you think would look good together. We'll need them for the next task.`,
              completed: false,
            },
            '14': {
              text: `I'm sensing a theme here`,
              note: `Open the "Main Menu" on the left, and select "Themes" from the list. Click the "Add New Theme" button at the top of the list to create a new Theme. Give each type of element their own template and save.`,
              completed: false,
            },
            '15': {
              text: `Application explanation`,
              note: `Go to the Theme List again. Next to your newly created Theme, click the "+" button to apply the theme to the whole page. This will set the default template of all elements to the template set by your theme.`,
              completed: false,
            },
            '16': {
              text: `Themes are a changing`,
              note: `Go to the Theme List again. Click the pencil button next to any Theme. Any changes you make in the editor should be immediately reflected in the page.`,
              completed: false,
            },
            '17': {
              text: `Rejoice!`,
              note: `If you've done everything before this, you've finished the CrashPad tutorial. Go forward and do what you want with it. I'm always looking for suggestions and ideas if there are any features you would like to see implemented.`,
              completed: false,
            }
          },
          template: '',
          templateStrict: false,
          theme: '',
          themeStrict: false,
        },
        contentList: [
          'title',
        ],
      },
    },
    templates: {
      templates: {
        'royalBlue': {
          templateName: 'Royal Blue',
          ui: 'royalBlue',
          styling: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#d4af37',
            'font:style': 'normal',
            'border:width': '2px',
            'border:style': 'solid',
            'border:color': '#CCCCCC',
            'border:radius': '0px',
            'background:color': '#0b2a5c',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:color': '#FFFFFF',
            'shadow:blur': '0px',
            'shadow:spread': '0px',
            'checkbox:icon': 'X',
            'checkbox:color': '#d4af37',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d4af37',
            'listItems:background': '#0b2a5c',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#CCCCCC',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#d4af37',
            'font:style': 'normal',
            'border:width': '2px',
            'border:style': 'solid',
            'border:color': '#CCCCCC',
            'border:radius': '0px',
            'background:color': '#0b2a5c',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:color': '#FFFFFF',
            'shadow:blur': '0px',
            'shadow:spread': '0px',
            'checkbox:icon': 'X',
            'checkbox:color': '#d4af37',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d4af37',
            'listItems:background': '#0b2a5c',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#CCCCCC',
          },
          disabled: {},
        },
        'royalFlourish': {
          templateName: 'Royal Flourish',
          ui: 'royalFlourish',
          styling: {
            'font:size': '20px',
            'font:family': 'Times New Roman',
            'font:color': '#c5b358',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#c5b358',
            'border:radius': '15px',
            'background:color': '#3f0975',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#754c9e',
            'checkbox:icon': 'X',
            'checkbox:color': '#c5b358',
            'listItems:size': 'medium',
            'listItems:fontColor': '#c5b358',
            'listItems:background': '#3f0975',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#c5b358',
          },
          stylingBackup: {
            'font:size': '20px',
            'font:family': 'Times New Roman',
            'font:color': '#c5b358',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#c5b358',
            'border:radius': '15px',
            'background:color': '#3f0975',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#754c9e',
            'checkbox:icon': 'X',
            'checkbox:color': '#c5b358',
            'listItems:size': 'medium',
            'listItems:fontColor': '#c5b358',
            'listItems:background': '#3f0975',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#c5b358',
          },
          disabled: {},
        },
        'royalLightBlue': {
          templateName: 'Royal Light Blue',
          ui: 'royalLightBlue',
          styling: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#816b22',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#0b2a5c',
            'border:radius': '10px',
            'background:color': '#c2c2c2',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#0b2a5c',
            'checkbox:icon': 'X',
            'checkbox:color': '#d4af37',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d4af37',
            'listItems:background': '#c2c2c2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#0b2a5c',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#816b22',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#0b2a5c',
            'border:radius': '10px',
            'background:color': '#c2c2c2',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#0b2a5c',
            'checkbox:icon': 'X',
            'checkbox:color': '#d4af37',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d4af37',
            'listItems:background': '#c2c2c2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#0b2a5c',
          },
          disabled: {},
        },
        'royalLightFlourish': {
          templateName: 'Royal Light Flourish',
          ui: 'royalLightFlourish',
          styling: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#3f0975',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#3f0975',
            'border:radius': '15px',
            'background:color': '#c2c2c2',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#0b2a5c',
            'checkbox:icon': 'X',
            'checkbox:color': '#3f0975',
            'listItems:size': 'medium',
            'listItems:fontColor': '#3f0975',
            'listItems:background': '#c2c2c2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#3f0975',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#3f0975',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#3f0975',
            'border:radius': '15px',
            'background:color': '#c2c2c2',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#0b2a5c',
            'checkbox:icon': 'X',
            'checkbox:color': '#3f0975',
            'listItems:size': 'medium',
            'listItems:fontColor': '#3f0975',
            'listItems:background': '#c2c2c2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#3f0975',
          },
          disabled: {},
        },
        'royalOcean': {
          templateName: 'Royal Ocean',
          ui: 'royalOcean',
          styling: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#c5b358',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#c5b358',
            'border:radius': '15px',
            'background:color': '#00506e',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#00516e',
            'checkbox:icon': 'X',
            'checkbox:color': '#c5b358',
            'listItems:size': 'medium',
            'listItems:fontColor': '#c5b358',
            'listItems:background': '#00506e',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#c5b358',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Times New Roman',
            'font:color': '#c5b358',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#c5b358',
            'border:radius': '15px',
            'background:color': '#00506e',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '4px',
            'shadow:yOffset': '4px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#00516e',
            'checkbox:icon': 'X',
            'checkbox:color': '#c5b358',
            'listItems:size': 'medium',
            'listItems:fontColor': '#c5b358',
            'listItems:background': '#00506e',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#c5b358',
          },
          disabled: {},
        },
        'mochaLight': {
          templateName: 'Mocha Light',
          ui: 'mochaLight',
          styling: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#573b1b',
            'font:style': 'normal',
            'border:width': '2px',
            'border:style': 'solid',
            'border:color': '#573b1b',
            'border:radius': '0px',
            'background:color': '#e8d4be',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#573b1b',
            'checkbox:icon': 'X',
            'checkbox:color': '#573b1b',
            'listItems:size': 'medium',
            'listItems:fontColor': '#573b1b',
            'listItems:background': '#e8d4be',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#573b1b',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#573b1b',
            'font:style': 'normal',
            'border:width': '2px',
            'border:style': 'solid',
            'border:color': '#573b1b',
            'border:radius': '0px',
            'background:color': '#e8d4be',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#573b1b',
            'checkbox:icon': 'X',
            'checkbox:color': '#573b1b',
            'listItems:size': 'medium',
            'listItems:fontColor': '#573b1b',
            'listItems:background': '#e8d4be',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#573b1b',
          },
          disabled: {},
        },
        'mochaMedium': {
          templateName: 'Mocha Medium',
          ui: 'mochaMedium',
          styling: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#573b1b',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#473117',
            'border:radius': '0px',
            'background:color': '#b09d87',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#573b1b',
            'checkbox:icon': 'X',
            'checkbox:color': '#573b1b',
            'listItems:size': 'medium',
            'listItems:fontColor': '#573b1b',
            'listItems:background': '#b09d87',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#473117',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#573b1b',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#473117',
            'border:radius': '0px',
            'background:color': '#b09d87',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#573b1b',
            'checkbox:icon': 'X',
            'checkbox:color': '#573b1b',
            'listItems:size': 'medium',
            'listItems:fontColor': '#573b1b',
            'listItems:background': '#b09d87',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#473117',
          },
          disabled: {},
        },
        'mochaDarkWShadow': {
          templateName: 'Mocha Dark w/ Shadow',
          ui: 'mochaDarkWShadow',
          styling: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#d9d0c5',
            'font:style': 'normal',
            'border:width': '0px',
            'border:style': 'solid',
            'border:color': '#000000',
            'border:radius': '0px',
            'background:color': '#473117',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '6px',
            'shadow:yOffset': '6px',
            'shadow:blur': '3px',
            'shadow:spread': '0px',
            'shadow:color': '#d9d0c5',
            'checkbox:icon': 'X',
            'checkbox:color': '#d9d0c5',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d9d0c5',
            'listItems:background': '#473117',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#000000',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#d9d0c5',
            'font:style': 'normal',
            'border:width': '0px',
            'border:style': 'solid',
            'border:color': '#000000',
            'border:radius': '0px',
            'background:color': '#473117',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '6px',
            'shadow:yOffset': '6px',
            'shadow:blur': '3px',
            'shadow:spread': '0px',
            'shadow:color': '#d9d0c5',
            'checkbox:icon': 'X',
            'checkbox:color': '#d9d0c5',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d9d0c5',
            'listItems:background': '#473117',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#000000',
          },
          disabled: {},
        },
        'mochaMediumAlternate': {
          templateName: 'Mocha Medium Alternate',
          ui: 'mochaMediumAlternate',
          styling: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#573b1b',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'double',
            'border:color': '#473117',
            'border:radius': '0px',
            'background:color': '#b09d87',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#573b1b',
            'checkbox:icon': 'X',
            'checkbox:color': '#573b1b',
            'listItems:size': 'medium',
            'listItems:fontColor': '#573b1b',
            'listItems:background': '#b09d87',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#473117',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Arial',
            'font:color': '#573b1b',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'double',
            'border:color': '#473117',
            'border:radius': '0px',
            'background:color': '#b09d87',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#573b1b',
            'checkbox:icon': 'X',
            'checkbox:color': '#573b1b',
            'listItems:size': 'medium',
            'listItems:fontColor': '#573b1b',
            'listItems:background': '#b09d87',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#473117',
          },
          disabled: {},
        },
        'mochaDarkAlternate': {
          templateName: 'Mocha Dark Alternate',
          ui: 'mochaDarkAlternate',
          styling: {
            'font:size': '20px',
            'font:family': 'Arial',
            'font:color': '#d9d0c5',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'outset',
            'border:color': '#70522f',
            'border:radius': '0px',
            'background:color': '#473117',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#d9d0c5',
            'checkbox:icon': 'X',
            'checkbox:color': '#d9d0c5',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d9d0c5',
            'listItems:background': '#473117',
            'listItems:borderWidth': '0px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#70522f',
          },
          stylingBackup: {
            'font:size': '20px',
            'font:family': 'Arial',
            'font:color': '#d9d0c5',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'outset',
            'border:color': '#70522f',
            'border:radius': '0px',
            'background:color': '#473117',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '6px',
            'shadow:spread': '2px',
            'shadow:color': '#d9d0c5',
            'checkbox:icon': 'X',
            'checkbox:color': '#d9d0c5',
            'listItems:size': 'medium',
            'listItems:fontColor': '#d9d0c5',
            'listItems:background': '#473117',
            'listItems:borderWidth': '0px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#70522f',
          },
          disabled: {},
        },
        'cherryBlossomMedium': {
          templateName: 'Cherry Blossom Medium',
          ui: 'cherryBlossomMedium',
          styling: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#db7093',
            'border:radius': '30px',
            'background:color': '#fff5fe',
            'background:image': '',
            'shadow:inset': 'inset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '20px',
            'shadow:spread': '7px',
            'shadow:color': '#eb8da8',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#fff5fe',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#db7093',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#db7093',
            'border:radius': '30px',
            'background:color': '#fff5fe',
            'background:image': '',
            'shadow:inset': 'inset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '20px',
            'shadow:spread': '7px',
            'shadow:color': '#eb8da8',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#fff5fe',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#db7093',
          },
          disabled: {},
        },
        'cherryBlossomDark': {
          templateName: 'Cherry Blossom Dark',
          ui: 'cherryBlossomDark',
          styling: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#ffedf2',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#ffedf2',
            'border:radius': '30px',
            'background:color': '#ffc2d3',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '3px',
            'shadow:yOffset': '3px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#eb8da8',
            'checkbox:icon': 'X',
            'checkbox:color': '#ffedf2',
            'listItems:size': 'medium',
            'listItems:fontColor': '#ffedf2',
            'listItems:background': '#ffc2d3',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#ffedf2',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#ffedf2',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#ffedf2',
            'border:radius': '30px',
            'background:color': '#ffc2d3',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '3px',
            'shadow:yOffset': '3px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#eb8da8',
            'checkbox:icon': 'X',
            'checkbox:color': '#ffedf2',
            'listItems:size': 'medium',
            'listItems:fontColor': '#ffedf2',
            'listItems:background': '#ffc2d3',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#ffedf2',
          },
          disabled: {},
        },
        'cherryBlossomDelicate': {
          templateName: 'Cherry Blossom Delicate',
          ui: 'cherryBlossomDelicate',
          styling: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#ffffff',
            'border:radius': '30px',
            'background:color': '#ffedf2',
            'background:image': '',
            'shadow:inset': 'inset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '8px',
            'shadow:spread': '0px',
            'shadow:color': '#ffffff',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#ffedf2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#ffffff',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#ffffff',
            'border:radius': '30px',
            'background:color': '#ffedf2',
            'background:image': '',
            'shadow:inset': 'inset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '8px',
            'shadow:spread': '0px',
            'shadow:color': '#ffffff',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#ffedf2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#ffffff',
          },
          disabled: {},
        },
        'cherryBlossomLight': {
          templateName: 'Cherry Blossom Light',
          ui: 'cherryBlossomLight',
          styling: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#db7093',
            'border:radius': '30px',
            'background:color': '#ffedf2',
            'background:image': '',
            'shadow:inset': 'inset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '10px',
            'shadow:spread': '5px',
            'shadow:color': '#ffffff',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#ffedf2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#db7093',
          },
          stylingBackup: {
            'font:size': '30px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '3px',
            'border:style': 'solid',
            'border:color': '#db7093',
            'border:radius': '30px',
            'background:color': '#ffedf2',
            'background:image': '',
            'shadow:inset': 'inset',
            'shadow:xOffset': '0px',
            'shadow:yOffset': '0px',
            'shadow:blur': '10px',
            'shadow:spread': '5px',
            'shadow:color': '#ffffff',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#ffedf2',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#db7093',
          },
          disabled: {},
        },
        'cherryBlossomBloom': {
          templateName: 'Cherry Blossom Bloom',
          ui: 'cherryBlossomBloom',
          styling: {
            'font:size': '20px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '5px',
            'border:style': 'double',
            'border:color': '#ffedf2',
            'border:radius': '30px',
            'background:color': '#ffe0e9',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '3px',
            'shadow:yOffset': '3px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#eb8da8',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#ffe0e9',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#ffedf2',
          },
          stylingBackup: {
            'font:size': '20px',
            'font:family': 'Garamond',
            'font:color': '#db7093',
            'font:style': 'normal',
            'border:width': '5px',
            'border:style': 'double',
            'border:color': '#ffedf2',
            'border:radius': '30px',
            'background:color': '#ffe0e9',
            'background:image': '',
            'shadow:inset': 'outset',
            'shadow:xOffset': '3px',
            'shadow:yOffset': '3px',
            'shadow:blur': '8px',
            'shadow:spread': '2px',
            'shadow:color': '#eb8da8',
            'checkbox:icon': 'X',
            'checkbox:color': '#db7093',
            'listItems:size': 'medium',
            'listItems:fontColor': '#db7093',
            'listItems:background': '#ffe0e9',
            'listItems:borderWidth': '1px',
            'listItems:borderStyle': 'solid',
            'listItems:borderColor': '#ffedf2',
          },
          disabled: {},
        }
      },
      templateList: [
        'Royal Blue',
        'Royal Flourish',
        'Royal Light Blue',
        'Royal Light Flourish',
        'Royal Ocean',
        'Mocha Light',
        'Mocha Medium',
        'Mocha Dark w/ Shadow',
        'Mocha Medium Alternate',
        'Mocha Dark Alternate',
        'Cherry Blossom Medium',
        'Cherry Blossom Dark',
        'Cherry Blossom Delicate',
        'Cherry Blossom Light',
        'Cherry Blossom Bloom',
      ],
      templateUIList: [
      ],
      usedNames: [
        'Royal Blue',
        'Royal Flourish',
        'Royal Light Blue',
        'Royal Light Flourish',
        'Royal Ocean',
        'Mocha Light',
        'Mocha Medium',
        'Mocha Dark w/ Shadow',
        'Mocha Medium Alternate',
        'Mocha Dark Alternate',
        'Cherry Blossom Medium',
        'Cherry Blossom Dark',
        'Cherry Blossom Delicate',
        'Cherry Blossom Light',
        'Cherry Blossom Bloom',
      ],
    },
    themes: {
      themes: {
        'mutedRoyal': {
          themeName: 'Muted Royal',
          ui: 'mutedRoyal',
          stylingTemplates: {
            'background': 'royalLightFlourish',
            'link': 'royalLightBlue',
            'multilink': 'royalBlue',
            'container': 'royalLightFlourish',
            'note': 'royalOcean',
            'checklist': 'royalFlourish',
          },
          disabledTypes: {},
        },
        'earthyMocha': {
          themeName: 'Earthy Mocha',
          ui: 'earthyMocha',
          stylingTemplates: {
            'background': 'mochaLight',
            'link': 'mochaMediumAlternate',
            'multilink': 'mochaLight',
            'container': 'mochaMedium',
            'note': 'mochaDarkWShadow',
            'checklist': 'mochaDarkAlternate',
          },
          disabledTypes: {},
        },
        'cherryBlossom': {
          themeName: 'Cherry Blossom',
          ui: 'cherryBlossom',
          stylingTemplates: {
            'background': 'cherryBlossomLight',
            'link': 'cherryBlossomDark',
            'multilink': 'cherryBlossomDelicate',
            'container': 'cherryBlossomMedium',
            'note': 'cherryBlossomLight',
            'checklist': 'cherryBlossomBloom',
          },
          disabledTypes: {},
        }
      },
      themeList: [
        'Cherry Blossom',
        'Earthy Mocha',
        'Muted Royal',
      ],
      themeUIList: [
        'Cherry Blossom',
        'Earthy Mocha',
        'Muted Royal',
      ],
      currentTheme: undefined,
      currentThemeStrict: undefined,
      usedThemeNames: [
        'Cherry Blossom',
        'Earthy Mocha',
        'Muted Royal',
      ],
    }
  }

  private newTemplateValues = {
    'font:size': '30px',
    'font:family': 'Arial',
    'font:color': '#000000',
    'font:style': 'normal',
    'border:width': '3px',
    'border:style': 'solid',
    'border:color': '#CCCCCC',
    'border:radius': '15px',
    'background:color': '#FFFFFF',
    'background:image': '',
    'shadow:inset': 'outset',
    'shadow:xOffset': '0px',
    'shadow:yOffset': '0px',
    'shadow:color': '#FFFFFF',
    'shadow:blur': '0px',
    'shadow:spread': '0px',
    'checkbox:icon': 'X',
    'checkbox:color': '#000000',
    'listItems:size': 'medium',
    'listItems:fontColor': '#000000',
    'listItems:background': '#FFFFFF',
    'listItems:borderWidth': '1px',
    'listItems:borderStyle': 'solid',
    'listItems:borderColor': '#000000',
  }

  public styles = {
    'confirmation-text-content' : {},
  }

  private defaultTemplates;

  constructor(
    private storageService: StorageService,
    private fb: FormBuilder,
    private utility: UtilityService,
  ) {
  }

  setFirstTime(firstTimeName: string, newState?: boolean): void {
    newState = (newState === undefined) ? !this.firstTime[firstTimeName] : newState;
    this.firstTime[firstTimeName] = newState;
  }

  //utility functions

  generateUID(): string {
    const characters: string = "abcdefghijklmnopqrstuvwxyz1234567890";
    let uid: string, r: number;
    while (true) {
      uid = "";
      for (var i = 0; i<this.uidCharacterCount; i++) {
        r = Math.floor(Math.random() * characters.length);
        uid += characters[r];
      }
      if (this.elements[uid] === undefined && this.templates[uid] === undefined) {
        return uid;
      }
    }
  }

  registerElementType(typeInfo: ElementTypeInfo): void {
    if (this.elementTypes[typeInfo.typeName] === undefined) {
      this.elementTypes[typeInfo.typeName] = typeInfo;
      this.utility.sPush(this.elementTypeList,typeInfo.typeName);
    }
  }
  
  getDefaultTheme() {
    let defaultTemplates;
    const protocols = {
      'assemble': () => {
        defaultTemplates = {};
        this.elementTypeList.forEach(type => {
          defaultTemplates[type] = this.elementTypes[type].defaultInfo.template.styling;
        })
        defaultTemplates['background'] = JSON.parse(JSON.stringify(defaultTemplates['container']));
        this.defaultTemplates = defaultTemplates;
      },
      'fromCache': () => {
        defaultTemplates = this.defaultTemplates;
      },
    }

    const protocol: string = (this.defaultTemplates === undefined) ? 'assemble' : 'fromCache';
    protocols[protocol]();

    return defaultTemplates;
  }

  confirm(message: string, confirmCallback: Function, cancelCallback?: Function): void {
    this.confirmationMessage = message;
    this.confirmConfirmation = confirmCallback;
    this.cancelConfirmation = cancelCallback || function() {this.enableMode('confirm',false)};
    this.enableMode('confirm',true);
  }

  confirmWithTextOptions(
    message: string, 
    textCallbackObj, 
    callbackObj, 
    header?: string, 
    fontSize: string = `20px`, 
    maxWidth: string = `1000px`, 
    column: boolean = false
  ) {
    const textConfirmationList: Array<string> = Object.keys(textCallbackObj);
    const value = this.forms.textConfirmations.value;
    const controlList: Array<string> = Object.keys(value);

    const pruneOldControls = () => {
      const removeList: Array<string> = controlList.filter(name => textCallbackObj[name] != undefined);
      removeList.forEach(name => {
        this.forms.textConfirmations.removeControl(name);
      })
    }

    const addAndPatchControls = () => {
      const addList: Array<string> = textConfirmationList.filter(name => value[name] === undefined);
      const patchList: Array<string> = textConfirmationList.filter(name => addList.indexOf(name) === -1);

      addList.forEach(name => {
        const textCallback = textCallbackObj[name];
        this.forms.textConfirmations.addControl(name, this.fb.control(textCallback.initial || ''))
      })
      const patch = {};
      patchList.forEach(name => {
        const textCallback = textCallbackObj[name];
        patch[name] = textCallback.initial || '';
      })
      this.forms.textConfirmations.patchValue(patch);
    }

    const checkRequiredText = () => {
      const requiredList: Array<string> = textConfirmationList.filter(name => textCallbackObj[name].required === true);
      let requiredMet: boolean = true;
      requiredList.some(name => {
        if (this.forms.textConfirmations.value[name] === '') {
          requiredMet = false;
          return true;
        }
      })
      return requiredMet;
    }

    const trapCallbacks = () => {
      const callbackNames: Array<string> = Object.keys(callbackObj).filter(name => name != `close`);
      const newCallbackObj = {};
      callbackNames.forEach(name => {
        const newCallback = function(callback) {
          return function() {
            const result = checkRequiredText();
            if (result) {
              callback();
            }
          }
        }(callbackObj[name]);
        newCallbackObj[name] = newCallback;
      })
      callbackObj = newCallbackObj;
    }

    pruneOldControls();
    addAndPatchControls();
    trapCallbacks();

    this.textConfirmationList = Object.keys(textCallbackObj);
    this.textConfirmations = textCallbackObj;
    this.confirmWithOptions(
      message,
      callbackObj,
      header,
      fontSize,
      maxWidth,
      column,
      false,
    )
  }

  confirmWithOptions(
    message: string, 
    callbackObj, 
    header?: string, 
    fontSize: string = '20px', 
    maxWidth: string = '1000px', 
    column: boolean = false,
    anyButtonCloses: boolean = true,
    clearTextConfirmations: boolean = true
  ): void {
    const trapCallbackFunctions = () => {
      if (callbackObj['close'] === undefined) {
        callbackObj['close'] = () => {};
      }
      const newCallback = function(callback,contextThis) {
        return function () {
          contextThis.enableMode('confirmWithOptions',false);
          callback();
        }
      };
      const callbacks: Array<string> = Object.keys(callbackObj);
      callbacks.forEach(name => {
        if (name === 'close' || anyButtonCloses) {
          callbackObj[name] = newCallback(callbackObj[name],this);
        }
      })
    }

    const resetTextConfirmations = () => {
      if (clearTextConfirmations) {
        this.textConfirmationList = [];
        this.textConfirmations = {};
      }
    }

    const setConfirmationsAndHeader = () => {
      this.confirmationMessage = message;
      this.confirmationHeader = header;
      this.confirmations = callbackObj;
      this.confirmationList = Object.keys(callbackObj).filter(name => name != 'close');
    }

    const setOptions = () => {
      const options = {
        fontSize: fontSize,
        maxWidth: maxWidth,
      };
      this.styles["confirmation-text-content"] = options;
      this.confirmModeColumn = column;
      this.enableMode(`confirmWithOptions`,true);
    }

    trapCallbackFunctions();
    resetTextConfirmations();
    setConfirmationsAndHeader();
    setOptions();
  }

  //element functions

  initializeElement(uid: string, callbackFunction: Function = () => {}): void {
    const fillObj = {
      overrides: {},
      disabled: {},
      template: '',
      templateStrict: false,
      theme: '',
      themeStrict: false,
    };
    const fillList = Object.keys(fillObj);
    const protocols = {
      'wait': () => {
        const int = setInterval(() => {
          const element = this.elements[uid];
          if (element != undefined) {
            const fillValue = (name) => {
              if (element[name] === undefined) {
                element[name] = fillObj[name];
              }
            }
            fillList.forEach(name => fillValue(name));
            const customization = this.elements[uid].customization;
            this.fullParse(uid,customization,true);
            callbackFunction();
            clearInterval(int);
          }
        },50)
      },
      'dontWait': () => {
        const customization = this.elements[uid].customization;
        this.fullParse(uid,customization,true);
        callbackFunction();
      },
    }

    const element = this.elements[uid];
    const protocol: string = (element === undefined) ? 'wait' : 'dontWait';
    protocols[protocol]();
  }

  newProjectToElement(ui: string, proj: NewProjection, projectionType: string = 'element') {
    console.log(`Projecting to ${ui}`);
    //console.log(`Element does ${this.elements[ui].overrides != undefined ? '' : 'not '} have overrides and does ${this.elements[ui].disabled != undefined ? '' : 'not '} have disabled.`);
    const element = this.elements[ui];
    element.overrides = element.overrides === undefined ? {} : element.overrides;
    element.disabled = element.disabled === undefined ? {} : element.disabled;
    const elementType: string = (ui === 'masterContainer') ? 'background' : element.elementType;

    const elementProjectionProtocol: string = (proj.elementProjection['ui'] != undefined) ?
      'reference' : 'direct';
    const templateProjectionProtocol: string = (proj.templateProjection['styling'] === undefined) ?
      'reference' : 'direct';
    const themeProjectionProtocol: string = (proj.themeProjection['stylingTemplates'] === undefined) ?
      'reference' : 'direct';

    let elementLayer, elementOverrides, elementDisabled, convertedElementLayer;
    const elementProjectionProtocols = {
      'reference': () => {
        const elementUI: string = proj.elementProjection['ui'];
        const element = this.elements[elementUI];
        elementLayer = (element === undefined) ? {} : Object.assign({}, element.customization);
        elementOverrides = Object.assign({}, element.overrides || {});
        elementDisabled = Object.assign({}, element.disabled || {});
      },
      'direct': () => {
        elementLayer = proj.elementProjection['customization'];
        elementOverrides = proj.elementProjection['overrides'];
        elementDisabled = proj.elementProjection['disabled'];
      },
    }

    let templateLayer, templateStrict: boolean, templateDisabled, templateOverride: boolean;
    const templateProjectionProtocols = {
      'reference': () => {
        const templateUI: string = proj.templateProjection['ui'];
        const template = this.templates[templateUI];
        //console.log(`Template for ${ui} does ${(template === undefined) ? 'not ':''}exist.`);
        templateLayer = (template === undefined) ? {} : Object.assign({}, template.styling);
        templateStrict = proj.templateProjection['strict'];
        templateDisabled = (template === undefined) ? {} : Object.assign({}, template.disabled);
        templateOverride = (elementOverrides['template:uid'] === true) ? true : false;
      },
      'direct': () => {
        templateOverride = (elementOverrides['template:uid'] === true) ? true : false;
        templateLayer = proj.templateProjection['styling'];
        templateStrict = proj.templateProjection['strict'];
        templateDisabled = proj.templateProjection['disabled'];
      },
    }

    let themeLayer, themeDisabled, themeStrict: boolean, themeOverride: boolean, themeUI: string, themeTemplates;
    const themeProjectionProtocols = {
      'reference': () => {
        themeUI = proj.themeProjection['ui'];
        const elementType: string = this.elements[ui].elementType;
        const theme = this.themes[themeUI];
        const themeTemplateUI: string = (theme === undefined) ? '' : theme.stylingTemplates[elementType];
        //console.log(`UI for Theme template of type ${elementType} (ui: ${ui}) is ${themeTemplateUI}`);
        themeLayer = (theme === undefined) ? {} : this.templates[themeTemplateUI].styling;
        themeStrict = (theme === undefined) ? false : theme.themeStrict || false;
        themeOverride = proj.themeProjection['themeOverride'];
        themeDisabled = (theme === undefined) ? {} : theme.disabledTypes;
      },
      'direct': () => {
        const element = this.elements[ui];
        const elementTheme = this.themes[element.customization['content:theme']];
        themeOverride = proj.themeProjection['themeOverride'];
        const assemblyProtocols = {
          'fromElement': () => {
            themeUI = element.customization['content:theme'];
            themeTemplates = elementTheme.stylingTemplates;
            const templateUI: string = themeTemplates[elementType];
            themeLayer = this.templates[templateUI].styling;
            themeStrict = elementTheme.strict;
            themeDisabled = elementTheme.disabledTypes;
          },
          'fromProjection': () => {
            themeUI = proj.themeProjection.ui;
            themeTemplates = proj.themeProjection['stylingTemplates'];
            const templateUI: string = themeTemplates[elementType];
            //console.log(`The projection ui for element ${ui} of type ${elementType} is ${templateUI}`);
            const template = this.templates[templateUI] || {styling: {}};
            themeLayer = template.styling;
            themeStrict = proj.themeProjection['strict'];
            themeDisabled = proj.themeProjection['disabled'];
          }
        }

        const overwrite: boolean = (proj.themeProjection['strict'] || themeOverride || element.overrides['content:theme'] != true || elementTheme === undefined) ? true : false;
        const assemblyProtocol: string = (overwrite) ? 'fromProjection' : 'fromElement';
        //console.log(`Theme override is ${themeOverride} | Element theme is ${(elementTheme === undefined) ? '' : 'not '}undefined.`);
        //console.log(`Assembly protocol for direct theme projection of ${ui} is ${assemblyProtocol}`);
        assemblyProtocols[assemblyProtocol]();
      },
    }

    let defaultLayer = this.getDefaultTheme()[elementType];

    elementProjectionProtocols[elementProjectionProtocol]();
    templateProjectionProtocols[templateProjectionProtocol]();
    themeProjectionProtocols[themeProjectionProtocol]();

    const getConvertedElementLayer = () => {
      convertedElementLayer = {};
      Object.keys(elementLayer).filter(style => style.split(":")[0] != 'content').forEach(
        style => {
          convertedElementLayer[style] = elementLayer[style];
        }
      )
      convertedElementLayer['listItems:fontColor'] = elementLayer['font:color'];
      convertedElementLayer['listItems:background'] = elementLayer['background:color'];
      convertedElementLayer['listItems:borderColor'] = elementLayer['border:color'];
      convertedElementLayer['checkbox:color'] = elementLayer['font:color'];
    }

    getConvertedElementLayer();

    Object.keys(templateLayer).forEach(name => {
      //console.log(`TemplateLayer: ${name} = ${templateLayer[name]}`);
    })
    Object.keys(themeLayer).forEach(name => {
      //console.log(`ThemeLayer: ${name} = ${themeLayer[name]}`);
    })

    let customizationList = Object.keys(elementLayer);
    customizationList = customizationList.concat(Object.keys(templateLayer).filter(name => customizationList.indexOf(name) === -1));
    customizationList = customizationList.concat(Object.keys(themeLayer).filter(name => customizationList.indexOf(name) === -1));

    const typeDisabled: boolean = (themeDisabled[elementType] === true) ? true : false;
    const newCustomization = {};
    const protocols = {
      'theme': (name) => {
        if (themeLayer[name] === undefined) {
          protocols['overridden'](name);
        } else if (typeDisabled) {
          protocols['default'](name);
        } else {
          newCustomization[name] = themeLayer[name];
          //console.log(`Applied successfully as theme. New value is ${themeLayer[name]}`);
        }
      },
      'overridden': (name) => {
        //console.log(`Applied successfully as overridden. New value is ${elementLayer[name]}`);
        newCustomization[name] = elementLayer[name];
      },
      'template': (name) => {
        if (templateLayer[name] === undefined) {
          protocols['theme'](name);
        } else {
          //console.log(`Applied successfully as template. New value is ${templateLayer[name]}`);
          newCustomization[name] = templateLayer[name];
        }
      },
      'default': (name) => {
        if (defaultLayer[name] === undefined) {
          protocols['overridden'](name);
        } else {
          //console.log(`Applied successfully as default. New value is ${defaultLayer[name]}`);
          newCustomization[name] = defaultLayer[name];
        }
      }
    }

    //console.log(`Template override is ${templateOverride}, type is ${elementType}, and typeDisabled is ${typeDisabled}`);
    customizationList.forEach(name => {
      const protocol: string = (elementDisabled[name] === true || themeStrict) ? 'theme' : 
        (!templateStrict && elementOverrides[name] === true) ? 'overridden' : 
        (templateOverride) ? 'template' :
        (templateDisabled[name] === true) ? 'theme' : 'template';
      //console.log(`The protocol for customization ${name} is ${protocol}`);
      protocols[protocol](name);
    });

    newCustomization['template:uid'] = proj.templateProjection.ui;
    newCustomization['template:name'] = this.templates[proj.templateProjection.ui]?.templateName || '';
    newCustomization['content:theme'] = proj.themeProjection.ui ;

    //console.log(`Finished Projecting ${ui}`);
    Object.keys(newCustomization).forEach(name => {
      //console.log(`Projecting ${newCustomization[name]} to ${name}`);
    })
    this.fullParse(ui, newCustomization, true);


    if (element.elementType === 'container') {
      console.log(`The projection target ${ui} is a container. Updating children.`);
      const childElementUIs: Array<string> = this.elements[ui].parsedCustomization.content.elementUIs;
      //console.log(`The children of ${ui} are |${this.elements[ui].parsedCustomization.content.elementUIs.join(' | ')}|`);
      childElementUIs.forEach(childUI => {
        console.log(`Updating child ${childUI}`);
        const child = this.elements[childUI];
        child.overrides = child.overrides === undefined ? {} : child.overrides;
        child.disabled = child.disabled === undefined ? {} : child.disabled;
        const theme = this.themes[child.customization['content:theme']];
        const childTemplate = (this.themes[themeUI] === undefined) ? child.template : '';
        const childTemplateOverride: boolean = (child.templateOverride === true) ? true : false;
        //console.log(`Child template override is ${childTemplateOverride}`);
        const childTemplateStrict = (this.themes[proj.themeProjection.ui] === undefined) ? child.templateStrict : false;
        //console.log(`Applying child template ${childTemplate} to ${childUI}`);
        const elementProjection = {
          ui: childUI,
        }

        const templateProjection = (childTemplate === '' || childTemplate === undefined) ? 
          {
            ui: undefined,
            strict: (childTemplateOverride) ? childTemplateStrict : false,
            styling: convertedElementLayer,
            disabled: elementDisabled,
          } : {
            ui: (childTemplateOverride) ? childTemplate : '',
            strict: (childTemplateOverride) ? childTemplateStrict : false,
          }

        console.log(`Template projection for child is ${(childTemplate === '' || childTemplate === undefined) ? '' : 'not '}derived from the parent!`);

        const overwrite: boolean = (themeStrict === true || child.overrides['content:theme'] != true || theme === undefined) ? true : false;
        //console.log(`Overwrite theme for ${childUI}? ${overwrite}`);

        const themeProjection = (projectionType === 'theme') ?
          {
            ui: (overwrite) ? 
              themeUI : child.customization['content:theme'],
            strict: (overwrite) ? 
              themeStrict : child.customization['content:themeStrict'] || false,
            themeOverride: false,
            stylingTemplates: (overwrite) ? 
              themeTemplates : theme.stylingTemplates,
            disabled: (overwrite) ? 
              themeDisabled : theme.disabled,
          } : {
            ui: (overwrite) ? 
              proj.themeProjection.ui : child.customization['content:theme'],
            strict: (overwrite) ? 
              proj.themeProjection.strict : child.customization['content:themeStrict'] || false,
            themeOverride: false,
          }
        
        //console.log(`Theme Strict: ${themeProjection.strict} | Theme Override: ${themeOverride} | themeDefined: ${theme != undefined}`);
        //console.log(`Child theme ui: ${child.customization['content:theme']}`);
        //console.log(`Theme Projection ui: ${themeProjection.ui} | strict: ${themeProjection.strict} | themeOverride: ${themeProjection.themeOverride}`);
        const childProjection: NewProjection = {
          elementProjection: elementProjection,
          templateProjection: templateProjection,
          themeProjection: themeProjection,
        };

        //console.log(`Projecting over child. Theme stylingTemplates are ${JSON.stringify(Object.keys(themeProjection.stylingTemplates || {}).map(type => `${type} = ${themeProjection.stylingTemplates[type]}`))}`);
        //console.log(`Disabled themeTypes are ${JSON.stringify(Object.keys(themeDisabled).filter(type=>themeDisabled[type]))}`);
        this.newProjectToElement(childUI, childProjection, projectionType);
      })
    }
  }

  projectToElement(ui: string, proj: Projection) {
    const elementLayer = proj.customization;

    //console.log(`Projecting template ${proj.templateUI} to ${ui}`);
    const template = this.templates[proj.templateUI];
    const templateLayer = (template === undefined) ? {} : template.styling;
    
    const element = this.elements[ui];
    let themeUI = (proj.themeOverride) ? proj.themeUI : element.parsedCustomization.content.theme;
    themeUI = (themeUI === undefined) ? proj.themeUI : themeUI;
    //console.log(`Projecting theme ${themeUI} to ${ui}`);
    const theme = this.themes[themeUI];
    const themeTemplate = (theme != undefined) ? this.templates[theme.stylingTemplates[element.elementType]] : 
      this.elementTypes[element.elementType].defaultInfo.template;
    const themeLayer = themeTemplate.styling;

    let customizationList = Object.keys(elementLayer);
    customizationList = customizationList.concat(Object.keys(templateLayer).filter(name => customizationList.indexOf(name) === -1));
    customizationList = customizationList.concat(Object.keys(themeLayer).filter(name => customizationList.indexOf(name) === -1));

    const newCustomization = {};
    const protocols = {
      'disabled': (name) => {
        //console.log(`Applying customization ${name} as disabled.`);
        if (themeLayer[name] === undefined) {
          //console.log(`Application failed...`);
          protocols['overridden'](name);
        } else {
          newCustomization[name] = themeLayer[name];
        }
      },
      'overridden': (name) => {
        //console.log(`Applying customization ${name} as overridden.`);
        newCustomization[name] = elementLayer[name];
      },
      'template': (name) => {
        //console.log(`Applying customization ${name} as template.`);
        if (templateLayer[name] === undefined) {
          //console.log(`Application failed.`);
          protocols['disabled'](name);
        } else {
          newCustomization[name] = templateLayer[name];
        }
      },
    }

    //console.log(`Overrides are ${JSON.stringify(proj.overrides)}`);
    //console.log(`Disabled are ${JSON.stringify(proj.disabled)}`);
    //console.log(`Customization list is ${JSON.stringify(customizationList)}`);
    customizationList.forEach(name => {
      const protocol: string = (proj.disabled[name] === true) ? 'disabled' : 
        (proj.overrides[name] === true) ? 'overridden' : 'template';
      protocols[protocol](name);
      //console.log(`Final value for ${name} is ${newCustomization[name]}`);
    });

    newCustomization['template:uid'] = proj.templateUI;
    newCustomization['template:name'] = this.templates[proj.templateUI]?.templateName || '';
    newCustomization['content:theme'] = proj.themeUI;

    //console.log(`Finished Projecting ${ui}`);
    Object.keys(newCustomization).forEach(name => {
      //console.log(`Projecting ${newCustomization[name]} to ${name}`);
    })
    this.fullParse(ui, newCustomization, true);

    if (element.elementType === 'container') {
      const childElementUIs: Array<string> = this.elements[ui].parsedCustomization.content.elementUIs;
      childElementUIs.forEach(childUI => {
        const child = this.elements[childUI];
        const childTemplate = (this.themes[proj.themeUI] === undefined) ? child.template : '';
        const childTemplateStrict = (this.themes[proj.themeUI] === undefined) ? child.templateStrict : false;
        //console.log(`Applying child template ${childTemplate} to ${childUI}`);
        const childProjection: Projection = {
          customization: child.customization,
          templateUI: childTemplate,
          templateStrict: childTemplateStrict,
          themeUI: proj.themeUI,
          themeOverride: false,
          themeStrict: proj.themeStrict,
          overrides: child.overrides || {},
          disabled: child.disabled || {},
        };
        this.projectToElement(childUI, childProjection);
      })
    }
  }

  fastUpdate(uid: string, customizationTag: string, newValue) {
    const element = this.elements[uid];

    if (element != undefined) {
      this.elements[uid].customization[customizationTag] = newValue;
      const customization = this.elements[uid].customization;
      this.fullParse(uid, customization, true);
    }
  }

  typeParse(uid: string, parseType: string, customization, publish: boolean = false) {
    const element = this.elements[uid];
    const elementType: string = element.elementType;

    const parseFunction: Function = this.elementTypes[elementType].parseTypes[parseType];
    const parsedObject = parseFunction(customization);
    if (publish) {
      this.publishParsedObject(uid, parseType, parsedObject);
    }
    return parsedObject;
  }

  fullParse(uid: string, customization, publish: boolean = false) {
    //console.log(`Fully parsing with fontColor customization ${JSON.stringify(customization['font:color'])}`);
    const element = this.elements[uid];
    const elementType = element.elementType;
    const parseTypes = this.elementTypes[elementType].parseTypes;

    const parseTypeList: Array<string> = Object.keys(parseTypes);
    const newParsedCustomization = {};
    parseTypeList.forEach(parseType => {
      //console.log(`Parsing type ${parseType}...`);
      newParsedCustomization[parseType] = this.typeParse(uid,parseType,customization,publish);
      //console.log(`Customization after ${parseType} parse.`);
      Object.keys(this.elements[uid].customization).forEach(style => {}/*console.log(`${style} = ${this.elements[uid].customization[style]}`)*/);
    });
    //this.elements[uid].lastCustomization = customization;
    if (publish) {
      this.elements[uid].parsedCustomization = newParsedCustomization;
    }
    return newParsedCustomization;
  }

  publishParsedObject(uid: string, parseType: string, parsedObject) {
    const protocols = {
      'wait': () => {
        const int = setInterval(() => {
          const element = this.elements[uid];
          if (element != undefined) {
            if (this.elements[uid].parsedCustomization === undefined) {
              this.elements[uid].parsedCustomization = {};
            }
            if (parseType === 'content') {
              const newContent = JSON.parse(JSON.stringify(this.elements[uid].content));
              Object.keys(parsedObject)
                .forEach(name => {
                  newContent[name] = parsedObject[name];
                })
              this.elements[uid].parsedCustomization[parseType] = newContent;
              this.elements[uid].content = newContent;
            } else {
              this.elements[uid].parsedCustomization[parseType] = parsedObject;
            }
            clearInterval(int);
          }
        },50)
      },
      'dontWait': () => {
        if (this.elements[uid].parsedCustomization === undefined) {
          this.elements[uid].parsedCustomization = {};
        }
        if (parseType === 'content') {
          const newContent = JSON.parse(JSON.stringify(this.elements[uid].content));
          Object.keys(parsedObject)
            .forEach(name => {
              newContent[name] = parsedObject[name];
            })
          this.elements[uid].parsedCustomization[parseType] = newContent;
          this.elements[uid].content = newContent;
        } else {
          this.elements[uid].parsedCustomization[parseType] = parsedObject;
        }
      },
    }

    const element = this.elements[uid];
    const protocol: string = (element === undefined) ? 'wait' : 'dontWait';
    protocols[protocol]();
  }

  specialParse(typeList: string | Array<string>, info) {
    //console.log(`Keys for info are ${JSON.stringify(Object.keys(info))}`);
    const parsedObject = {};
    const addItemToObject = (infoName,targetName) => {
      const infoStyle: string = info[infoName];
      if (infoStyle != undefined) {
        parsedObject[targetName] = infoStyle;
      }
    }
    
    const sizeReference = {
      'small': '12px',
      'medium': '16px',
      'large': '20px',
      'x-large': '24px',
    };

    const parseTypes = {
      'font': () => {
        const addObj = {
          'font:size': 'fontSize',
          'font:family': 'fontFamily',
          'font:color': 'color',
        };
        Object.keys(addObj).forEach(name => {
          addItemToObject(name,addObj[name]);
        })
        
        const fontStyle: string = info['font:style'];
        if (fontStyle != undefined) {
          if (fontStyle === 'bold') {
            parsedObject['fontWeight'] = '700';
          } else {
            parsedObject['fontStyle'] = fontStyle;
          }
        }
      },
      'border': () => {
        addItemToObject('border:width','borderWidth');
        addItemToObject('border:style','borderStyle');
        addItemToObject('border:color','borderColor');
        addItemToObject('border:radius','borderRadius');
      },
      'simpleBorder': () => {
        addItemToObject('border:width','borderWidth');
        addItemToObject('border:style','borderStyle');
        addItemToObject('border:color','borderColor');
      },
      'background': () => {
        addItemToObject('background:color','backgroundColor');

        const backgroundImage: string = info['background:image'];
        const urlRegExp = RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        if (urlRegExp.test(backgroundImage)) {
          parsedObject['backgroundImage'] = backgroundImage;
        }
      },
      'shadow': () => {
        const shadowObj = {};
        const addToShadowObj = (itemName: string, targetName: string) => {
          const styling: string = info[itemName];
          if (styling != undefined) {
            shadowObj[targetName] = styling;
          }
        }

        addToShadowObj('shadow:inset','inset');
        addToShadowObj('shadow:xOffset','xOffset');
        addToShadowObj('shadow:yOffset','yOffset');
        addToShadowObj('shadow:blur','blur');
        addToShadowObj('shadow:spread','spread');
        addToShadowObj('shadow:color','color');

        const shadowString: string = this.stringifyShadow(shadowObj);
        if (shadowString != '' && shadowString != undefined) {
          parsedObject['boxShadow'] = shadowString;
        }
      },
      'checkbox': () => {
        addItemToObject('checkbox:icon','checkboxIcon');
        addItemToObject('checkbox:color','borderColor');
        addItemToObject('checkbox:color','color');
        
        const listItemSize: string = info['listItem:size'];
        if (listItemSize != undefined) {
          const convertedSize: string = sizeReference[listItemSize] || sizeReference.medium;
          parsedObject['fontSize'] = convertedSize;
        }
      },
      'listItems': () => {
        addItemToObject('listItems:background','backgroundColor');
        addItemToObject('listItems:fontColor','color');
        
        const listItemSize: string = info['listItems:size'];
        if (listItemSize != undefined) {
          const convertedSize: string = sizeReference[listItemSize] || sizeReference.medium;
          parsedObject['fontSize'] = convertedSize;
        }
        
        const shadowObj = {};
        const addToShadowObj = (itemName: string, targetName: string) => {
          const styling: string = info[itemName];
          if (styling != undefined) {
            shadowObj[targetName] = styling;
          }
        }
      },
      'content': () => {
        const parsedObject = this.parseContent(info);
        return parsedObject;
      },
    }

    const protocols = {
      'oneType': (type: string) => {
        parseTypes[type]();
      },
      'manyTypes': (types: Array<string>) => {
        types.forEach(type => {
          parseTypes[type]();
        })
      }
    }

    const protocol: string = (typeof typeList === 'string') ? 'oneType' : 'manyTypes';
    protocols[protocol](typeList);

    return parsedObject;
  }

  parseBorder(borderString: string) {
    const borderList: Array<string> = borderString.split(" ");
    const borderPropList: Array<string> = ['width','style','color'];

    let borderObject = {};
    const assembleBorderObject = () => {
      borderPropList.some((prop, index) => {
        const value: string = borderList[index];
        if (value === undefined) {
          borderObject = {};
          return true;
        } else {
          borderObject[prop] = value;
        }
      })
    }

    assembleBorderObject();
    return borderObject;
  }

  stringifyBorder(borderObj = {}): string {
    const borderPropOrder: Array<string> = ['width','style','color'];

    let borderString: string;
    const assembleBorderString = () => {
      let borderStringList: Array<string> = [];
      borderPropOrder.some(prop => {
        const value = borderObj[prop];
        if (value === undefined) {
          borderStringList = [];
          return true;
        } else {
          borderStringList.push(value);
        }
      })
      borderString = borderStringList.join(" ");
    }

    assembleBorderString();
    return borderString;
  }

  parseShadow(shadowString: string) {
    const shadowList: Array<string> = shadowString.split(" ");

    let shadowPropList: Array<string>;
    const assemblePropReference = () => {
      const inset = (shadowList[0] == 'inset') ? true:false;
      shadowPropList = ['xOffset','yOffset','blur','spread','color'];
      if (inset) {shadowPropList.unshift('inset')};
    }

    let shadowObject = {}
    const assembleShadowObject = () => {
      shadowPropList.some((prop,index) => {
        const value: string = shadowList[index];
        if (value === undefined) {
          shadowObject = {};
          return true;
        } else {
          shadowObject[prop] = value;
        }
      })
    }

    assemblePropReference();
    assembleShadowObject();
    return shadowObject;
  }

  stringifyShadow(shadowObj): string {
    let shadowPropOrder: Array<string>;
    const assembleShadowPropReference = () => {
      const inset = (shadowObj.inset === 'inset') ? true : false;
      shadowPropOrder = ['xOffset','yOffset','blur','spread','color'];
      if (inset) {shadowPropOrder.unshift('inset')};
    }

    let shadowString: string;
    const assembleShadowString = () => {
      const defaultValues = {
        'blur': '0px',
        'spread': '0px',
        'color': '#000000',
      };
      let shadowStringList: Array<string> = [];
      shadowPropOrder.some(prop => {
        const value = shadowObj[prop];
        if (value === undefined) {
          const defaultValue: string = defaultValues[prop];
          if (defaultValue != undefined) {
            shadowStringList.push(defaultValue);
          } else {
            shadowStringList = [];
            return true;
          }
        } else {
          shadowStringList.push(value);
        }
      })
      shadowString = shadowStringList.join(" ");
    }

    assembleShadowPropReference();
    assembleShadowString();
    return shadowString;
  }

  parseFont(fontString: string) {
    const fontList: Array<string> = fontString.split(" ");
    const fontPropList: Array<string> = ['size','family'];

    let fontObject = {};
    const assembleFontObject = () => {
      fontPropList.some((prop,index) => {
        const value: string = fontList[index];
        if (value === undefined) {
          fontObject = {};
          return true;
        } else {
          fontObject[prop] = value;
        }
      })
    }

    assembleFontObject();
    return fontObject;
  }

  stringifyFont(fontObj): string {
    const fontPropOrder: Array<string> = ['size','family'];

    let fontString: string;
    const assembleFontString = () => {
      let fontStringList: Array<string> = [];
      fontPropOrder.some(prop => {
        const value = fontObj[prop];
        if (value === undefined) {
          fontStringList = [];
          return true;
        } else {
          fontStringList.push(value);
        }
      })
      fontString = fontStringList.join(" ");
    }

    assembleFontString();
    return fontString;
  }

  parseContent(info) {
    const contentObj = {};
    const assembleContentObject = () => {
      const infoKeys: Array<string> = Object.keys(info);
      infoKeys.forEach(name => {
        const [target,subTarget] = name.split(":");
        if (target === 'content') {
          contentObj[subTarget] = info[name];
        }
      })
    }

    assembleContentObject();
    return contentObj;
  }
  
  unparseContent(contentObj) {
    const subGroups: Array<string> = Object.keys(contentObj);
  
    const contentInfo = {};
    const assembleContentInfo = () => {
      subGroups.forEach(subGroup => {
        const target = `content:${subGroup}`;
        contentInfo[target] = contentObj[subGroup];
      })
    }
    
    assembleContentInfo();
    return contentInfo;
  }

  setMode(newMode: string): void {
    let modeAllowed: boolean = false;
    const checkModeIsAllowed = () => {
      const allowedModes: Array<string> = [
        'utilize',
        'customize',
      ]
      if (allowedModes.indexOf(newMode) != -1) {
        modeAllowed = true;
      }
    }

    const saveAndSet = () => {
      if (modeAllowed) {
        if (newMode === 'utilize') {
          this.saveElements();
        }
        this.mode = newMode;
      }
    }

    checkModeIsAllowed();
    saveAndSet();
  }

  setElementReference(uid?: string, info?: ElementInfo,): string {
    uid = uid || this.generateUID();
    this.elements[uid] = info || {};
    this.saveElements();
    return uid;
  }

  saveElements(): void {
    if (this.elements != undefined && Object.keys(this.elements).length > 0) {
      //console.log(`Saving Elements as ${JSON.stringify(this.elements)}`);
      this.storageService.setValue('elements',JSON.stringify(this.elements),'local');
    }
  }

  fastLoad(load, save: boolean = false): void {
    //console.log(`Fast loading...`);
    this.loadTemplates(load);
    this.loadThemes(load);
    this.loadElements(load);
    if (save) {
      this.saveElements();
      this.saveTemplates();
      this.saveThemes();
    }
    window.location.reload(true);
  }

  loadElements(save?): void {
    let elementSave, elementMemoryExists: boolean = true, saveProtocol: string;
    const assembleElementsObject = () => {
      const protocols = {
        'fromSave': () => {
          elementSave = save.elements;
        },
        'fromMemory': () => {
          let elementMemory = this.storageService.getValue('elements','local');
          elementMemoryExists = (elementMemory === undefined || elementMemory === null) ? false : true;
          //elementMemoryExists = false;
          //console.log(`Element memory does ${elementMemoryExists ? '' : 'not '}exist.`);
          if (!elementMemoryExists) {
            elementMemory = JSON.parse(JSON.stringify(this.defaults.elements));
            Object.keys(elementMemory).forEach(ui => {
              const element = elementMemory[ui];
              //console.log(`Checking element with ui ${ui}... Element does ${element === undefined ? 'not ':''}exist.`);
              const contentKeys: Array<string> = Object.keys(element.content);
              contentKeys.forEach(contentName => {
                const customizationName: string = `content:${contentName}`;
                elementMemory[ui].customization[customizationName] = element.content[contentName];
              })
            })
            elementMemory = JSON.stringify(elementMemory);
          }
          //console.log(elementMemory);
          elementSave = JSON.parse(elementMemory);
        },
      }

      const saveExists = (save != undefined && save.elements != undefined) ? true : false;
      saveProtocol = (saveExists) ? 'fromSave' : 'fromMemory';
      protocols[saveProtocol]();
    }

    const publishElementsObjectAndUpdateAll = () => {
      this.elements = elementSave;
      //console.log(`Elements loaded!`);
      //console.log(`Number of elements is ${Object.keys(this.elements).length}`);
      this.updateAllCustomizations();
    }

    const onFirstLoadShowThemeChoice = () => {
      if (!elementMemoryExists) {
        this.displayWelcome(true);
        this.saveElements();
      }
    }

    assembleElementsObject();
    publishElementsObjectAndUpdateAll();
    onFirstLoadShowThemeChoice();
  }

  displayWelcome(selectFirstTheme: boolean = false): void {
    let defaultWelcomeText: string = `Welcome to CrashPad, a central hub to save all of your links (or lists (or notes)).
    Think of it as your desktop for the web. A place to keep links to all your favorites sites, web apps, recipes, or whatever else.
    CrashPad is also fully customizable so it can look exactly the way you like. Just pick a default theme or build one from scratch.
    In the near future, themes will be exchangable with a simple line of text if you feel the creative passion and want to eventually share your work.
    Good luck.`;
    if (selectFirstTheme) {
      defaultWelcomeText += ' Mission ready on your mark...';
    }
    const gotItButtonText: string = (selectFirstTheme) ? 'Launch!' : 'Got it!';
    const options = {
      [gotItButtonText]: () => {if (selectFirstTheme) {this.displayThemeChoice();} else {this.enableMode('confirmWithOptions',false)}},
      'close': () => {if (selectFirstTheme) {this.displayThemeChoice();} else {this.enableMode('confirmWithOptions',false)}},
    }
    this.confirmWithOptions(
      defaultWelcomeText,
      options,
      `***big-icon***`,
      `24px`,
      `700px`,
      false,
      false,);
  }

  displayThemeChoice(): void {
    this.enableMode('themeManager',true);
    
    /*
    const chooseThemeText: string = `What theme do you want to start with?`;
    const options = {
      'Cherry Blossom': () => {this.applyTheme('cherryBlossom',true,true);this.enableMode(`confirmWithOptions`,false);},
      'Earthy Mocha': () => {this.applyTheme('earthyMocha',true,true);this.enableMode(`confirmWithOptions`,false);},
      'Muted Royal': () => {this.applyTheme('mutedRoyal',true,true);this.enableMode(`confirmWithOptions`,false);},
    }
    this.confirmWithOptions(chooseThemeText,options,`Let's get Things Going`,`24px`,`700px`,true);
    */
  }

  wipeData(confirmed: boolean = false,saveAsBackup: boolean = true): void {
    const protocols = {
      'unconfirmed': () => {
        const options = {
          'Cancel' : () => {this.enableMode('confirmWithOptions',false)},
          'Reset without Saving' : () => {this.wipeData(true,false);this.enableMode('confirmWithOptions',false);},
        };
        this.confirmWithOptions(
          `Are you sure you want to wipe all elements, templates, and themes?
          (This will return your CrashPad to the default state as if you had launched it for the first time)`,
          options,
          `Clearing All Data`,
          `24px`,
          `700px`,
        )
      },
      'confirmed': () => {
        this.storageService.deleteValue('elements','local');
        this.storageService.deleteValue('templates','local');
        this.storageService.deleteValue('themes','local');
        this.storageService.deleteValue('pinnedChecklistUI','local'); //This target needs to be the same as the save target in checklistOverlayService
        window.location.reload();
      },
    }

    const protocol: string = (confirmed) ? 'confirmed' : 'unconfirmed';
    protocols[protocol]();
  }

  toggleWaitingElement(containerUID: string, uid: string): void {
    const protocols = {
      'unset': () => {
        this.waitingElement = undefined;
        this.waitingContainer = undefined;
      },
      'set': () => {
        this.waitingElement = uid;
        this.waitingContainer = containerUID;
      },
    };

    const protocol = (this.waitingContainer === containerUID && this.waitingElement === uid) ? 'unset' : 'set';
    protocols[protocol]();
  }

  moveWaitingElementTo(targetContainer: string): boolean { 
    let moveIsPossible: boolean = true;
    const checkIfMoveIsPossible = () => {
      moveIsPossible = (this.waitingElement === targetContainer || this.waitingContainer === targetContainer) ? false : true;
    }

    const moveItemAndClearWaitingItem = () => {
      if (moveIsPossible) {
        this.moveElement(this.waitingElement, this.waitingContainer, targetContainer);
        this.waitingElement = undefined;
        this.waitingContainer = undefined;
      }
    }

    checkIfMoveIsPossible();
    moveItemAndClearWaitingItem();
    return moveIsPossible;
  }

  assembleCustomization(
    templateStyling: StylingInfo,
    elementStyling: StylingInfo,
    overrides: StylingToggles,
    disabled: StylingToggles,
    strict: boolean = false
  ) {
    let newStyling = {};
    const addNonDisabledElementStylings = () => {
      let elementStylingNames: Array<string> = Object.keys(elementStyling || {});  //.filter(name => !disabled[name]);
      elementStylingNames.forEach(name => {newStyling[name] = elementStyling[name]});
    }

    const addNonDisabledNonOverriddenTemplateStylings = () => {
      let templateStylingNames: Array<string> = Object.keys(templateStyling || {});
      if (!strict) {
        templateStylingNames = templateStylingNames.filter(name => !overrides[name] && !disabled[name]);
      }
      templateStylingNames = templateStylingNames.filter(name => templateStyling[name] != undefined);
      templateStylingNames.forEach(name => {newStyling[name] = templateStyling[name]});
    }

    addNonDisabledElementStylings();
    //console.log(`NewStyling after element stylings ${JSON.stringify(newStyling)}`);
    addNonDisabledNonOverriddenTemplateStylings();
    //console.log(`NewStyling after template stylings ${JSON.stringify(newStyling)}`);
    return newStyling;
  }

  updateCustomization(ui: string, strict: boolean = false): void {
    //console.log(`=====================================================================`);
    const element = this.elements[ui];
    let template, newStyling;

    const affirmElementHasBackup = () => {
      if (element.customizationBackup === undefined) {
        this.elements[ui].customizationBackup = Object.assign({},element.customization);
      }
    }

    const getTemplate = () => {
      //console.log(`DefaultTemplate is ${element.defaultTemplate}`);
      //console.log(`Element default template is ${element.defaultTemplate}`);
      //console.log(`Element template is ${element.template}`);
      template = element.defaultTemplate ? this.elementTypes[element.elementType].defaultInfo.template : this.templates[element.template];
      template = template === undefined ? {styling:{}}:template;
      //console.log(`Template styling loaded is ${JSON.stringify(template.styling)}`);
    }

    const assembleStyling = () => {
      const overrides = element.overrides || {};
      const disabled = element.disabled || {};
      //console.log(`Assembling new stylings`);
      const templateKeys: Array<string> = Object.keys(template.styling);
      //console.log(`Theme being applied------------------------------------------------`);
      templateKeys.forEach(style =>{}); //console.log(`${style} = ${template.styling[style]}`));
      Object.keys(element.content)
        .forEach(name => {
          element.customization[`content:${name}`] = element.content[name];
        })
      Object.keys(element.customization).filter(name => templateKeys.indexOf(name) === -1)
        .forEach(name => {
          //console.log(`Comparing ${name}: Template ${template.styling[name]} | Element ${element.customization[name]}`)
        })
      newStyling = this.assembleCustomization(template.styling,element.customization,overrides,disabled,strict);
      //console.log(`NewStyling is ${JSON.stringify(newStyling)}`);
    }

    const setNewStyling = () => {
      this.elements[ui].customization = Object.assign({}, newStyling);
      this.elements[ui].customizationBackup = Object.assign(this.elements[ui].customizationBackup,newStyling);
    }

    const parseNewStyling = () => {
      //console.log(`Performing a full parse of ${ui} with customization ${JSON.stringify(customization)}`);
      this.fullParse(ui, this.elements[ui].customization, true);
    }

    affirmElementHasBackup();
    getTemplate();
    assembleStyling();
    //console.log(`Diplaying assembled customization for ${ui}`);
    Object.keys(newStyling).forEach(style => {}); //console.log(`${style} = ${newStyling[style]}`));
    setNewStyling();
    parseNewStyling();
    //console.log(`Diplaying posted customization for ${ui}`);
    Object.keys(this.elements[ui].customization).forEach(style => {}); //console.log(`${style} = ${this.elements[ui].customization[style]}`));
  }

  updateAllCustomizations(strict: boolean = false): void {
    const uis: Array<string> = Object.keys(this.elements);
    uis.forEach(ui => {
      this.updateCustomization(ui, strict);
    });
  }

  setTemplate(ui: string, templateUI: string, save: boolean = true, theme: boolean = false): void {
    const strategies = {
      'default': () => {
        const elementType: string = this.elements[ui].elementType;
        const defaultInfo = this.elementTypes[elementType].defaultInfo;
        let newStyling;
        let newBackupStyling;

        const assembleStylings = () => {
          newStyling = {};
          newBackupStyling = Object.assign({},defaultInfo['template'].styling);
          const stylingNames = Object.keys(newBackupStyling);
          stylingNames.forEach(name => {
            if (!this.elements[ui].disabled[name]) {
              newStyling[name] = newBackupStyling[name];
            }
          })
        }

        const setStylings = () => {
          this.elements[ui].template = templateUI;
          this.elements[ui].customization = newStyling;
          this.elements[ui].customizationBackup = newBackupStyling;
          this.elements[ui].customizationList = Object.keys(defaultInfo['template'].styling);
          this.elements[ui].defaultTemplate = (templateUI === undefined) ? false:true;
        }

        assembleStylings();
        setStylings();
      },
      'template': () => {
        const setTemplateValues = () => {
          if (!theme || (theme && !this.elements[ui].templateOverride)) {
            this.elements[ui].template = templateUI;
            this.elements[ui].defaultTemplate = false;
            this.elements[ui].customization['template:uid'] = templateUI;
            this.elements[ui].customization['template:template'] = templateUI;
            this.updateCustomization(ui);
          }
        }

        setTemplateValues();
      }
    };
    const element = this.elements[ui];

    let template: boolean;
    const checkNewTemplateAndTemplate = () => {
      template = (templateUI != undefined || templateUI != '(default)');
    }

    const setNewTemplateClearOverridesAndSave = () => {
      const strategy: string = template ? 'template' : 'default';
      //console.log(`Setting template with strategy ${strategy}`);
      strategies[strategy]();
      this.elements[ui].overrides = {};
      //console.log(`Customization before save...`);
      Object.keys(this.elements[ui].customization).forEach(style => {}); //console.log(`${style} = ${this.elements[ui].customization[style]}`));
      if (save) {console.log(`Saving changes`);this.saveElements()};
      //console.log(`Customization after save...`);
      Object.keys(this.elements[ui].customization).forEach(style => {}); //console.log(`${style} = ${this.elements[ui].customization[style]}`));
    }

    checkNewTemplateAndTemplate();
    setNewTemplateClearOverridesAndSave();
  }

  setContainerAsTemplate(ui: string, parentUI: string, save: boolean = true) {
    const element = this.elements[ui];
    const elementCustomization = element.customization;
    const overrides = element.overrides || {};
    const parentElement = this.elements[parentUI];
    const parentCustomization = parentElement.customization;

    const convertedCustomization = JSON.parse(JSON.stringify(elementCustomization));
    const getConvertedContainerStyling = () => {
      Object.keys(parentCustomization).filter(style => style.split(":")[0] != 'content').forEach(
        style => {
          if (!overrides[style]) {
            convertedCustomization[style] = parentCustomization[style];
          }
        }
      )
      convertedCustomization['listItems:fontColor'] = parentCustomization['font:color'];
      convertedCustomization['listItems:background'] = parentCustomization['background:color'];
      convertedCustomization['listItems:borderColor'] = parentCustomization['border:color'];
      convertedCustomization['checkbox:color'] = parentCustomization['font:color'];
    }

    const overwriteElementStyling = () => {
      this.elements[ui].customization = convertedCustomization;
    }

    let parsedCustomization;
    const getNewParsedCustomization = () => {
      parsedCustomization = this.fullParse(ui, convertedCustomization, save);
    }

    getConvertedContainerStyling();
    overwriteElementStyling();
    getNewParsedCustomization();
    return parsedCustomization;
  }

  clearTemplate(ui:string): void {
    this.elements[ui].template = undefined;
  }

  createNewElement(ui: string, elementType: string): void {
    const typeInfo = this.elementTypes[elementType];
    const defaultInfo = typeInfo.defaultInfo;

    const newElement = {
      elementType: elementType,
      customization: {},
      content: {},
      contentList: [],
      disabled: {},
      overrides: {},
      defaultTemplate: false,
      templateOverride: false,
      template: undefined,
    };
    const assembleNewElement = () => {
      if (typeInfo != undefined) {
        newElement.customization = Object.assign({},defaultInfo.customization)
        newElement.content = JSON.parse(JSON.stringify(defaultInfo.content));
        newElement.contentList = defaultInfo.contentList.slice();
        
        const contents: Array<string> = Object.keys(defaultInfo.content);
        contents.forEach(content => {
          const keyName: string = `content:${content}`;
          newElement.customization[keyName] = defaultInfo.content[content];
        })

        const theme = this.themes[this.currentTheme];
        if (theme != undefined && !theme.disabledTypes[elementType]) {
          newElement.template = theme.stylingTemplates[elementType];
        }
      }
    }

    const publishNewElement = () => {
      this.elements[ui] = newElement;
      this.updateCustomization(ui);
      this.fullParse(ui,this.elements[ui].customization,true);
    }
    
    //console.log(`Assembling new element with UI ${ui}`);
    Object.keys(newElement).forEach(
      name => {} //console.log(`${name} = ${JSON.stringify(newElement[name])}`)
    );
    assembleNewElement();
    publishNewElement();
  }

  moveElement(elementUID: string, containerUID: string, targetContainerUID: string): void {
    let moveRequirementsMet: boolean;
    const checkMoveRequirements = () => {
      const targetContainerExists: boolean = (this.elements[targetContainerUID] != undefined) ? true : false;
      const targetContainerIsAContainerr: boolean = this.elements[targetContainerUID].content.elementUIs != undefined ? true : false;
      const currentContainerExists: boolean = this.elements[containerUID] != undefined ? true : false;
      const currentContainerIsAContainer: boolean = this.elements[containerUID].content.elementUIs != undefined ? true : false;
      moveRequirementsMet = (targetContainerExists && targetContainerIsAContainerr && currentContainerExists && currentContainerIsAContainer) ? true : false;
    }

    const moveElement = () => {
      const index = this.elements[containerUID].parsedCustomization.content.elementUIs.indexOf(elementUID);
      //console.log(`Index of ${elementUID} within elementUI list is ${index}`);
      //console.log(`ElementUIs are ${JSON.stringify(this.elements[containerUID].parsedCustomization.content.elementUIs)}`);
      if (moveRequirementsMet && index != -1) {
        //console.log(`State before typeParse is ${JSON.stringify(this.elements[containerUID].parsedCustomization.content)}`);
        this.elements[containerUID].customization['content:elementUIs'].splice(index,1);
        const containerCustomization = this.elements[containerUID].customization;
        this.typeParse(containerUID,'content',containerCustomization,true);
        //console.log(`Result of typeParse is ${JSON.stringify(this.elements[containerUID].parsedCustomization.content)}`);
        this.elements[targetContainerUID].customization['content:elementUIs'].push(elementUID);
        const targetContainerCustomization = this.elements[targetContainerUID].customization;
        this.typeParse(targetContainerUID,'content',targetContainerCustomization,true);
        this.saveElements();
      }
    }
    
    checkMoveRequirements();
    //console.log(`Move requirements met ${moveRequirementsMet}`);
    moveElement();
  }

  deleteElement(uid: string, confirm: boolean = false, parentUI: string): void {
    const protocols = {
      'unconfirmed': () => {
        let options = {
          'Cancel' : () => {this.enableMode('confirmWithOptions',false)},
          'Delete' : () => {this.deleteElement(uid,true,parentUI);this.enableMode('confirmWithOptions',false)},
        };
        this.confirmWithOptions(
          `Are you sure you want to delete this element?`,
          options,
        );
      },
      'confirmed': () => {
        const removeElementFromParent = () => {
          //console.log(`ParentUI is ${parentUI}`);
          const newElementUIs: Array<string> = this.elements[parentUI].customization['content:elementUIs']
            .filter(ui => ui != uid);
          //console.log(`Element UIs after filter are ${JSON.stringify(newElementUIs)}`);
          this.elements[parentUI].customization['content:elementUIs'] = newElementUIs;
          this.fullParse(parentUI, this.elements[parentUI].customization, true);
        }

        const deleteElementMemoryAndSave = () => {
          delete this.elements[uid];
          this.saveElements();
        }

        removeElementFromParent();
        setTimeout(() => {
          deleteElementMemoryAndSave();
        },1000)
      },
    }

    const protocol: string = (confirm) ? 'confirmed' : 'unconfirmed';
    protocols[protocol]();
  }

  //template functions

  enableMain(state: boolean = true, ui?: string): void {
    if (this.templateState.disabled === state) {
      if (state) {
      } else {
        this.viewOrder = [];
      }
      this.templateState.disabled = !state;
    }
  }

  setViewMode(mode: string): void {
    const modes: Array<string> = ['manager','themeManager','newTemplate','confirm','confirmWithOptions'];
    if (modes.indexOf(mode) != -1) {
      this.viewMode = mode;
    }
  }

  enableMode(mode: string, enable?: boolean, ui?: string): void {
    //console.log(`Enabling mode ${mode} with enable ${enable === undefined ? 'undefined' : enable}`);
    const viewExists: boolean = (this.view[mode] != undefined) ? true : !this.view[mode];
    enable = (enable != undefined) ? enable : !this.view[mode];

    const setViewState = () => {
      const newView = Object.assign({},this.view);
      newView[mode] = enable;
      this.view = newView;
    }

    let closeViewer: boolean = false;
    const updateViewOrder = () => {
      let index: number = this.viewOrder.indexOf(mode);
      if (index != -1) {
        this.viewOrder.splice(index,1);
      }
      this.viewOrder.unshift(mode);
      if (this.viewOrder.length === 0) {
        closeViewer = true;
      }
    }

    const setNewViewMode = () => {
      let finalView;
      this.viewOrder.some((view, index) => {
        finalView = view;
        //console.log(`Checking ${view}... ${this.view[view]}`);
        if (this.view[view] === true) {
          this.setViewMode(view);
          if (view === 'manager') {
            this.setSearchText('','template');
          } else if (view === 'themeManager') {
            this.setSearchText('', 'theme')
          }
          this.enableMain(true,ui);
          return true;
        } else if (index + 1 >= this.viewOrder.length) {
          this.enableMain(false);
        }
      })
      //console.log(`Final view is ${finalView}`);
    }

    if (!viewExists) {return};
    setViewState();
    updateViewOrder();
    //console.log(`New view order is ${JSON.stringify(this.viewOrder)}`);
    if (closeViewer) {this.enableMain(false)};
    setNewViewMode();
  }

  toggleTemplateState(b: boolean = true): void {
    this.templateState.disabled = !b;
  }

  parseTemplate(customization) {
    let convertedCustomization;
    const parseTemplateCustomization = () => {
      const parseList: Array<string> = ['font','shadow','border','background'];
      convertedCustomization = this.specialParse(parseList, customization);
    }

    parseTemplateCustomization();
    return convertedCustomization;
  }

  newTemplate(templateStyling: StylingInfo, uid?: string, templateName: string = '') {
    uid = (uid === undefined) ? this.generateUID() : uid;
    const template = this.templates[uid];

    let templateExists: boolean;
    const checkTemplateExists = () => {
      templateExists = (template != undefined) ? true : false;
      templateName = (templateExists && templateName === '') ? template.templateName : templateName;
    }

    let newTemplateState;
    const assembleTemplateInfo = () => {
      let styling, stylingBackup, disabled;
      if (templateExists) {
        disabled = Object.assign({}, template.disabled);
        styling = Object.assign({}, template.styling);
      } else {
        disabled = {};
        styling = JSON.parse(JSON.stringify(templateStyling));
      }
      stylingBackup = JSON.parse(JSON.stringify(templateStyling));
      newTemplateState = {
        styling: styling,
        stylingBackup: stylingBackup,
        templateName: templateName,
        ui: uid,
        disabled: disabled,
      }
    }

    const patch = {};
    const prepareNewTemplateForm = () => {
      const prepareList: Array<string> = Object.keys(newTemplateState.stylingBackup);
      prepareList.unshift('templateName');
      prepareList.forEach(name => {
        const value = newTemplateState[name];
        if (!this.forms.newTemplateForm.contains(name)) {
          this.forms.newTemplateForm.addControl('templateName', this.fb.control(value));
        } else {
          patch[name] = value;
        }
      })
    }

    const publishNewTemplate = () => {
      this.forms.newTemplateFormList = Object.keys(newTemplateState.stylingBackup);
      this.newTemplateState = newTemplateState;
      this.forms.newTemplateForm.patchValue(patch);
    }

    const enableEditorAndToggleTemplateState = () => {
      this.enableMode('newTemplate',true);
      this.toggleTemplateState();
    }

    checkTemplateExists();
    assembleTemplateInfo();
    prepareNewTemplateForm();
    publishNewTemplate();
    enableEditorAndToggleTemplateState();
    return uid;
  }

  checkTemplateName(templateUI: string, templateName: string): boolean {
    let result: boolean = true;
    const templateUIs: Array<string> = Object.keys(this.templates);
    templateUIs.some(ui => {
      if (ui != templateUI) {
        if (this.templates[ui].templateName === templateName) {
          result = false;
          return true;
        } 
      }
    })
    return result;
  }

  createNewTemplate(ui?: string): string {
    const getElementUI = () => {
      ui = (ui != undefined) ? ui : this.generateUID();
    }

    const templateInfo = {
      templateName: undefined,
      ui: undefined,
      styling: undefined,
      stylingBackup: undefined,
      disabled: undefined,
    }
    const assembleTemplateInfo = () => {
      templateInfo.templateName = '';
      templateInfo.ui = ui;
      templateInfo.styling = Object.assign({}, this.newTemplateValues);
      templateInfo.stylingBackup = Object.assign({}, this.newTemplateValues);
      templateInfo.disabled = {};
    }

    const publishTemplateInfo = () => {
      this.templates[ui] = templateInfo;
    }

    const updateTemplateLists = () => {
      this.updateTemplateLists();
    }

    getElementUI();
    assembleTemplateInfo();
    publishTemplateInfo();
    updateTemplateLists();
    return ui;
  }

  updateTemplateLists(): void {
    //console.log(`Updating template lists`);
    const unorderedTemplateUIList = Object.keys(this.templates);
    let newTemplateNameList : Array<string> = [];
    let newTemplateUIList: Array<string> = [];
    unorderedTemplateUIList.forEach(ui => {
      const templateName: string = this.templates[ui].templateName;
      const pushedObj = this.utility.pushAlphaAndLocate(newTemplateNameList, templateName);
      //console.log(`Pushing ${templateName} to ${pushedObj.location}`);
      //console.log(`newTemplateNameList: ${JSON.stringify(newTemplateNameList)}`);
      newTemplateNameList = pushedObj.array;
      newTemplateUIList.splice(pushedObj.location, 0, ui);
    })
    this.templateUIList = newTemplateUIList;
    this.templateList = newTemplateNameList;
    //console.log(`Template list is ${JSON.stringify(this.templateList)}`);
  }

  createTemplate(templateName: string, templateInfo: TemplateInfo, ui?: string): void {
    ui = (ui === undefined) ? this.generateUID() : ui;
    const template = this.templates[ui];
    const templateExists: boolean = (template != undefined) ? true : false;
    
    let nameIsUnique: boolean;
    const checkNameIsUnique = () => {
      nameIsUnique = (this.usedNames.indexOf(templateName) != -1) ? true : false;
    }

    const updateUsedNamesAndTemplateLists = () => {
      this.updateTemplateLists();
    }

    const setTemplateInfoAndAssert = () => {
      this.templates[ui] = templateInfo;
      this.parseTemplate(templateInfo.styling);
      this.assertTemplate(ui);
      this.saveTemplates();
    }

    checkNameIsUnique();
    if (!nameIsUnique) {return};
    updateUsedNamesAndTemplateLists();
    setTemplateInfoAndAssert();
  }

  updateTemplate(templateUI: string, templateInfo: TemplateInfo, templateElements?: Array<string>) {
    const templateExists: boolean = (this.templates[templateUI] != undefined) ? true : false;

    const getTemplateElements = () => {
      if (templateElements === undefined) {
        templateElements = Object.keys(this.elements)
          .filter(elementUI => this.elements[elementUI].template === templateUI);
      }
      //console.log(`TemplateElements for update are ${JSON.stringify(templateElements)}`);
    }

    const updateTemplateInfo = () => {
      //console.log(`TemplateInfo before Update ${JSON.stringify(templateInfo)}`);
      Object.keys(this.templates[templateUI]).forEach(name => {
        if (templateInfo[name] === undefined) {
          templateInfo[name] = this.templates[templateUI][name];
        }
      });
      //console.log(`TemplateInfo after Update ${JSON.stringify(templateInfo)}`);
      templateInfo['templateVisual'] = this.parseTemplate(templateInfo.styling);
      
      this.templates[templateUI] = templateInfo;
    }

    const updateTemplateElements = () => {
      templateElements.forEach(elementUI => {
        this.updateCustomization(elementUI);
      })
      this.saveElements();
      this.updateTemplateLists();
      this.saveTemplates();
    }

    //console.log(`Templates are ${JSON.stringify(Object.keys(this.templates))}`);
    //console.log(`${JSON.stringify(this.templates[templateUI])}`);
    //console.log(`Updating template ${templateUI}. It does ${templateExists ? '':'not '}exist.`);
    if (!templateExists) {return};
    getTemplateElements();
    updateTemplateInfo();
    updateTemplateElements();
  }

  editTemplate(templateUI: string): void {
    //console.log(`Editing template ${templateUI}`);
    const template = this.templates[templateUI];
    const templateExists: boolean = (template != undefined) ? true : false;

    let newTemplateState, styling, stylingList: Array<string>;
    const assembleNewTemplateState = () => {
      styling = template.stylingBackup || template.styling;
      styling = Object.assign({}, styling);
      //console.log(`Background color of styling is ${styling['background:color']}`);
      stylingList = Object.keys(styling);
      stylingList.unshift('templateName');
      styling.templateName = template.templateName;
      newTemplateState = {
        styling: template.styling,
        stylingBackup: template.stylingBackup,
        templateName: template.templateName,
        ui: templateUI,
        disabled: template.disabled || {},
      }
    }

    const publishInfoToForms = () => {
      this.newTemplateState = newTemplateState;
      this.setTemplateForm('newTemplateForm',styling,stylingList);
    }

    const enableEditorAndToggleTemplateState = () => {
      this.enableMode('newTemplate',true);
      this.toggleTemplateState();
    }

    if (!templateExists) {return};
    assembleNewTemplateState();
    publishInfoToForms();
    enableEditorAndToggleTemplateState();
  }

  removeTemplate(ui: string,confirmed: boolean = false): void {
    const protocols = {
      'unconfirmed': () => {
        let options = {
          'Cancel': () => {this.enableMode('confirmWithOptions',false)},
          'Remove': () => {this.removeTemplate(ui,true);this.enableMode('confirmWithOptions',false);this.enableMode('manager',true);},
        }
        this.confirmWithOptions(
          `Are you sure you want to remove template "${this.templates[ui].templateName}"?`,
          options,
        )
      },
      'confirmed': () => {
        let template = this.templates[ui];
        this.templateList.splice(this.templateList.indexOf(template.templateName),1);
        this.templateUIList.splice(this.templateUIList.indexOf(ui),1);
        this.usedNames.splice(this.usedNames.indexOf(this.templates[ui].templateName),1);
        delete this.templates[ui];
        this.saveTemplates();
      }
    }

    const protocol: string = (confirmed) ? 'confirmed' : 'unconfirmed';
    protocols[protocol]();
  }

  removeTemplateByName(templateName: string): void {
    let templateUIs = Object.keys(this.templates);
    let templateUI: string, name: string;
    const templateFound: boolean = templateUIs.some(ui => {
      const template = this.templates[ui];
      if (template.templateName === templateName) {
        this.removeTemplate(templateUI);
        return true;
      }
    })
    if (!templateFound) {
      throw new Error(`Could not find template with name ${templateName}.`);
    }
  }

  setTemplateForm(formName: string,formObj: object, formList?: Array<string>) {
    const formState = Object.assign({},this.forms[formName].value);
    const stylingNames = Object.keys(formState);
    let waitingStylingNames = formList || Object.keys(formObj);
    
    const assembleWaitingStyleNames = () => {
      stylingNames.forEach(name => {
        const value = formObj[name];
        if (value === undefined || value === '') {
          this.forms[formName].removeControl(name);
        } else {
          waitingStylingNames.splice(waitingStylingNames.indexOf(name),1);
        }
      })
    }
    
    let patch = {};
    const assembleFormInfo = () => {
      waitingStylingNames.forEach(name => {
        const value = formObj[name];
        const exists: boolean = this.forms[formName].contains(name);
        if (value != '') {
          if (exists) {
            patch[name] = value;
          } else {
            this.forms[formName].addControl(name, this.fb.control(value));
          }
        }
      })
    }

    const publishFormInfo = () => {
      this.forms[formName].patchValue(patch);
      this.forms[`${formName}List`] = Object.keys(this.forms[formName].value);
    }

    assembleWaitingStyleNames();
    assembleFormInfo();
    publishFormInfo();
  }

  submitNewTemplateForm(): string {
    let ui: string = this.newTemplateState.ui || this.generateUID();

    let styling, stylingBackup, templateName;
    const assembleStylingAndStylingBackup = () => {
      styling = Object.assign({}, this.forms.newTemplateForm.value);
      stylingBackup = Object.assign({}, this.forms.newTemplateForm.value);
      this.forms.newTemplateFormList.forEach(name => {
        const value = styling[name];
        const disabled: boolean = (this.templates[ui] != undefined && this.templates[ui].disabled != undefined && this.templates[ui].disabled[name]);
        if (disabled) {
          delete styling[name];
        } else if (value === '') {
          this.forms.newTemplateForm.removeControl(name);
        }
      });
      templateName = styling.templateName;
      delete styling['templateName'];
      delete stylingBackup['templateName'];
    }

    const assembleAndCreateTemplate = () => {
      let templateObj: TemplateInfo = {
        styling: styling,
        stylingBackup: stylingBackup,
        templateName: templateName,
        ui: ui,
        disabled: this.newTemplateState.disabled || {},
      }
      this.createTemplate(templateName,templateObj,ui);
    }

    const clearNewTemplateStateAndDisableMode = () => {
      this.newTemplateState = null;
      this.enableMode('newTemplate',false);
    }

    assembleStylingAndStylingBackup();
    assembleAndCreateTemplate();
    clearNewTemplateStateAndDisableMode();
    return ui;
  }

  cancelNewTemplateForm(): void {
    const cleanUpAndDisableEditor = () => {
      this.newTemplateState = undefined;
      this.enableMode('newTemplate',false);
      this.toggleTemplateState(false);
    }

    cleanUpAndDisableEditor();
  }

  assertTemplate(templateUI: string) {
    let elementUIs: Array<string>;
    
    const filterUpdateList = () => {
      elementUIs = Object.keys(this.elements).filter(ui => {
        const template = this.elements[ui].template;
        return (template === templateUI) ? true : false;
      })
    }

    const updateElements = () => {
      elementUIs.forEach(ui => {
        this.updateCustomization(ui);
      })
    }

    filterUpdateList();
    updateElements();
  }

  disableTemplateCustomization(customizationName: string, state?: boolean): void {
    const fillUndefinedState = () => {
      const currentState: boolean = this.newTemplateState.disabled[customizationName];
      state = (state === undefined) ? !currentState : state;
    }

    const setNewDisabledState = () => {
      this.newTemplateState.disabled[customizationName] = state;
    }

    fillUndefinedState();
    setNewDisabledState();
  }

  saveTemplates(): void {
    let save;
    const assembleTemplateSave = () => {
      save = {
        templates: this.templates,
        templateList: this.templateList,
        templateUIList: this.templateUIList,
        usedNames: this.usedNames,
      }
    }

    const publishTemplateSave = () => {
      this.storageService.setValue('templates',JSON.stringify(save),'local');
    }

    assembleTemplateSave();
    publishTemplateSave();
  }

  loadTemplates(save?): void {
    let templateSave, templateMemoryExists: boolean, saveProtocol: string;
    const assembleTemplatesObject = () => {
      const protocols = {
        'fromSave': () => {
          templateSave = save.templates;
        },
        'fromMemory': () => {
          let templateMemory = this.storageService.getValue('templates','local');
          templateMemoryExists = (templateMemory === undefined || templateMemory === null) ? false : true;

          //console.log(`Template memory does ${templateMemoryExists ? '' : 'not '}exist.`);
          if (!templateMemoryExists) {
            Object.keys(this.firstTime).forEach(key => this.firstTime[key] = true);
            templateMemory = JSON.stringify(this.defaults.templates);
          }
          templateSave = JSON.parse(templateMemory);
        },
      }

      const saveExists = (save != undefined && save.templates != undefined) ? true : false;
      saveProtocol = (saveExists) ? 'fromSave' : 'fromMemory';
      protocols[saveProtocol]();
    }

    let templatesObject;
    const assembleOtherTemplatesInfo = () => {
      let newUsedNames: Array<string>;
      let newTemplateList: Array<string>;
      let newTemplateUIList: Array<string>;
      if (!templateMemoryExists) {
        newUsedNames = [];
        newTemplateList = [];
        newTemplateUIList = [];
        Object.keys(templateSave.templates).forEach(ui => {
          const template = templateSave.templates[ui];
          let templateName = template.templateName;
          templateName = (templateName === undefined) ? ui : templateName;
          this.utility.sPush(newUsedNames,templateName);
          this.utility.pushAlphabetical(newTemplateList,templateName);
          this.utility.sPush(newTemplateUIList,ui);
          templateSave.templates[ui].templateVisual = this.parseTemplate(template.styling);
        });
      } else {
        newUsedNames = templateSave.usedNames.slice();
        newTemplateList = templateSave.templateList.slice();
        newTemplateUIList = templateSave.templateUIList.slice();
      }
      templatesObject = {
        templates: templateSave.templates,
        usedNames: newUsedNames,
        templateList: newTemplateList,
        templateUIList: newTemplateUIList,
      }
    }

    const publishTemplatesInfo = () => {
      this.templates = templatesObject.templates
      this.usedNames = templatesObject.usedNames;
      this.templateList = templatesObject.templateList;
      this.templateUIList = templatesObject.templateUIList;
      //console.log(`Templates loaded!`);
      //console.log(`Number of templates loaded is ${Object.keys(this.templates).length}`);
      if (!templateMemoryExists) {
        this.saveTemplates();
      }
    }

    assembleTemplatesObject();
    assembleOtherTemplatesInfo();
    //console.log(`Number of templates after load is ${Object.keys(templatesObject.templates).length} and they are ${JSON.stringify(Object.keys(templatesObject.templates))}`);
    publishTemplatesInfo();
  }

  //Theme functions

  saveThemes(): void {
    let save;
    const assembleThemeSave = () => {
      save = {
        themes: this.themes,
        themeList: this.themeList,
        themeUIList: this.themeUIList,
        currentTheme: this.currentTheme,
        currentThemeStrict: this.currentThemeStrict,
        usedThemeNames: this.usedThemeNames,
      }
    }

    const publishThemeSave = () => {
      this.storageService.setValue('themes',JSON.stringify(save),'local');
    }
    
    assembleThemeSave();
    publishThemeSave();
  }
  
  loadThemes(save?): void {
    let themeSave, themeMemoryExists: boolean, saveProtocol: string;
    const assembleThemesObject = () => {
      const protocols = {
        'fromSave': () => {
          themeSave = save.themes;
        },
        'fromMemory': () => {
          let themeMemory = this.storageService.getValue('themes','local');
          themeMemoryExists = (themeMemory === undefined || themeMemory === null) ? false : true;
          //console.log(`Theme memory does ${themeMemoryExists ? '' : 'not '}exist.`);
          if (!themeMemoryExists) {
            themeMemory = JSON.stringify(this.defaults.themes);
          }
          themeSave = JSON.parse(themeMemory);
          //console.log(`After loading from memory, themeMemory is ${JSON.stringify(themeSave)}`);
        },
      }

      const saveExists = (save != undefined && save.themes != undefined) ? true : false;
      saveProtocol = (saveExists) ? 'fromSave' : 'fromMemory';
      protocols[saveProtocol]();
    }

    let themesObject;
    const assembleOtherThemeInfo = () => {
      let newUsedThemeNames: Array<string>;
      let newthemeList: Array<string>;
      let newthemeUIList: Array<string>;
      let newCurrentTheme: string;
      let newCurrentThemeStrict: boolean;
      if (!themeMemoryExists) {
        newUsedThemeNames = [];
        newthemeList = [];
        newthemeUIList = [];
        Object.keys(themeSave.themes).forEach(ui => {
          //console.log(`Iterating theme ui ${ui}`);
          let themeName = themeSave.themes[ui].themeName;
          themeName = (themeName === undefined) ? ui : themeName;
          this.utility.sPush(newUsedThemeNames,themeName);
          this.utility.pushAlphabetical(newthemeList,themeName);
          this.utility.sPush(newthemeUIList,ui);
        });
        newCurrentTheme = undefined;
        newCurrentThemeStrict = false;
      } else {
        newUsedThemeNames = themeSave.usedThemeNames.slice();
        newthemeList = themeSave.themeList.slice();
        newthemeUIList = themeSave.themeUIList.slice();
        newCurrentTheme = themeSave.currentTheme;
        newCurrentThemeStrict = themeSave.currentThemeStrict;
      };
      themesObject = {
        themes: themeSave.themes,
        usedThemeNames: newUsedThemeNames,
        themeList: newthemeList,
        themeUIList: newthemeUIList,
        currentTheme: newCurrentTheme,
        currentThemeStrict: newCurrentThemeStrict,
      };
    }

    const publishThemeInfoAndApply = () => {
      this.themes = themesObject.themes;
      //console.log(`Themes UIs are ${Object.keys(this.themes)}`);
      this.themeList = themesObject.themeList;
      this.themeUIList = themesObject.themeUIList;
      this.currentTheme = themesObject.currentTheme;
      this.currentThemeStrict = themesObject.currentThemeStrict;
      this.usedThemeNames = themesObject.usedThemeNames;
      if (this.currentTheme != undefined) {
        //this.applyTheme(this.currentTheme,this.currentThemeStrict);
      }
      if (!themeMemoryExists) {
        this.saveThemes();
      }

      //console.log(`Themes loaded!`);
      //console.log(`Number of themes loaded is ${Object.keys(this.themes).length}`);
    }
    
    assembleThemesObject();
    assembleOtherThemeInfo();
    publishThemeInfoAndApply();
    //console.log(`Theme UIs after load ${JSON.stringify(themesObject.themeUIList)}`);
  }

  createTheme(themeInfo: ThemeInfo): void {
    const publishThemeInfo = () => {
      const protocols = {
        'newTheme': () => {
          let newThemeList: Array<string> = [];
          let newThemeUIList: Array<string> = [];
          const themeUIs: Array<string> = Object.keys(this.themes);
          themeUIs.forEach(ui => {
            const name = this.themes[ui].themeName;
            if (newThemeList.indexOf(name) === -1) {
              const pushedObj = this.utility.pushAlphaAndLocate(newThemeList,name);
              newThemeList = pushedObj.array;
              const index = pushedObj.location;
              newThemeUIList.splice(index,0,ui);
            }
          });
          this.themeList = newThemeList;
          this.themeUIList = newThemeUIList;
        },
        'overwrite': () => {
          this.themes[themeInfo.ui] = themeInfo;
        },
      }
  
      const themeExists = (this.themes[themeInfo.ui] != undefined) ? true : false;
      const protocol = (themeExists) ? 'overwrite' : 'newTheme';
      protocols[protocol]();
    }

    const applyThemeAndSaveThemes = () => {
      const thisThemeIsCurrent: boolean = (this.currentTheme === themeInfo.ui) ? true : false;
      if (thisThemeIsCurrent) {
        this.applyTheme(themeInfo.ui,true,true,);
      }
      
      const padUIs: Array<string> = this.elements['masterContainer'].parsedCustomization.content['elementUIs'].slice();
      padUIs.forEach(ui => {
        const element = this.elements[ui];
        let themeUI = element.parsedCustomization.content.theme;
        if (themeUI === themeInfo.ui) {
          this.applyPadTheme(ui, themeUI, false, true);
        }
      })

      //console.log(`About to save themes. Themes are ${JSON.stringify(Object.keys(this.themes))}`);
      this.saveThemes();
    }
    
    publishThemeInfo();
    applyThemeAndSaveThemes();
  }

  removeTheme(themeUI: string, confirmed: boolean = false): void {
    const protocols = {
      'unconfirmed': () => {
        let options = {
          'Cancel' : () => {this.enableMode('confirmWithOptions',false)},
          'Delete' : () => {this.removeTheme(themeUI,true);this.enableMode('confirmWithOptions',false);},
        };
        this.confirmWithOptions(
          `Are you sure you want to delete ${this.themes[themeUI].themeName}?`,
          options,
        )
      },
      'confirmed': () => {
        let theme = this.themes[themeUI];
        if (theme != undefined) {
          this.utility.sPush(this.themeList,theme.themeName,false);
          this.utility.sPush(this.themeUIList,themeUI,false);
          this.utility.sPush(this.usedThemeNames,theme.themeName,false);
          if (this.currentTheme === themeUI) {
            this.currentTheme = undefined;
          }
          delete this.themes[themeUI];
          this.updateAllCustomizations();
          this.saveThemes();
        }
      },
    }

    const protocol = (confirmed) ? 'confirmed' : 'unconfirmed';
    protocols[protocol]();
  }

  applyTheme(themeUI?: string, strict?: boolean, confirmed: boolean = false) {
    //console.log(`Apply theme ${themeUI} with strict ${strict} and confirmed ${confirmed}`);
    const subProtocol: string = (themeUI === '(none)') ? 'unsetTheme' : 'setTheme';
    const protocol: string = (confirmed || this.currentTheme === themeUI) ? 'confirmed' : 'unconfirmed';
    //console.log(`Protocol for apply theme is ${protocol}`);

    let response;
    const protocols = {
      'unconfirmed': () => {
        const subProtocols = {
          'unsetTheme': () => {
            if (this.currentTheme === undefined) {return};
            let options = {
              'Cancel': () => {this.enableMode('confirmWithOptions',false)},
              'Unset Theme': () => {this.applyTheme(themeUI,strict,true);this.enableMode('confirmWithOptions',false)},
            }
            this.confirmWithOptions(
              `Are you sure you want to unset this Theme?`,
              options,
              `Removing Theme`,
              `24px`,
              `700px`,
            )
          },
          'setTheme': () => {
            response = new Promise((resolve, reject) => {
              let options = {
                'Cancel': () => {this.enableMode('confirmWithOptions',false);resolve(false)},
                'Apply' : () => {this.applyTheme(themeUI,strict,true);this.enableMode('confirmWithOptions',false);this.enableMode('themeManager',false);resolve(true)},
              }
              this.confirmWithOptions(
                `Are you sure you want to apply this theme?`,
                options,
              )
            })
          },
        }

        subProtocols[subProtocol]();
      },
      'confirmed': () => {
        const subProtocols = {
          'unsetTheme': () => {
            this.currentTheme = undefined;
            this.currentThemeStrict = false;
          },
          'setTheme': () => {
            let theme;
            const fillUndefinedParametersAndGetTheme = () => {
              themeUI = (themeUI === undefined) ? this.currentTheme : themeUI;
              strict = (strict === undefined) ? this.currentThemeStrict : strict;
              theme = this.themes[themeUI];
            };
    
            let elementUIs: Array<string>;
            const assembleListOfElementsAffected = () => {
              elementUIs = Object.keys(this.elements).filter(ui => {
                const elementType: string = this.elements[ui].elementType;
                return (!theme.disabledTypes[elementType]) ? true : false;
              })
            }
    
            const updateTemplatesOfElements = () => {
              const updateTemplateInfo = (ui, strict, templateUI) => {
                if (strict) {
                  this.elements[ui].overrides = {};
                  this.elements[ui].disabled = {};
                  this.elements[ui].templateOverride = false;
                  this.elements[ui].defaultTemplate = false;
                }
                //console.log(`Setting the template of ${ui} to ${templateUI}`);
                this.setTemplate(ui, templateUI, false, true);
              }

              updateTemplateInfo('masterContainer', strict, theme.stylingTemplates['background']);

              const padUIs: Array<string> = this.elements['masterContainer'].parsedCustomization.content['elementUIs'];
              padUIs.forEach(ui => {
                const padElement = this.elements[ui];
                const padTheme: string = padElement.parsedCustomization.content.theme;
                let padThemeStrict: boolean = padElement.parsedCustomization.content.themeStrict;
                padThemeStrict = (padThemeStrict === undefined) ? false : padThemeStrict;
                const subTheme = (padTheme != undefined && padTheme != '') ? this.themes[padTheme] : theme;
                const padStylingTemplates = subTheme.stylingTemplates;
                const padDisabledTypes = subTheme.disabledTypes;

                updateTemplateInfo(ui, padThemeStrict, padStylingTemplates.container);

                const childUIs: Array<string> = padElement.parsedCustomization.content.elementUIs;
                childUIs.forEach(childUI => {
                  const child = this.elements[childUI];
                  const childType = child.elementType;
                  if (!padDisabledTypes[childType]) {
                    const childTemplate = padStylingTemplates[childType];
                    updateTemplateInfo(childUI, padThemeStrict, childTemplate);
                  }
                })
              })
            }
    
            const updateCurrentThemeAndSave = () => {
              this.currentTheme = themeUI;
              this.currentThemeStrict = strict;
              //console.log(`About to save Elements`);
              this.saveElements();
              this.saveThemes();
            }
    
            fillUndefinedParametersAndGetTheme();
            if (theme === undefined) {return};
            assembleListOfElementsAffected();
            //console.log(`Elements affected by application ${elementUIs}`);
            updateTemplatesOfElements();
            updateCurrentThemeAndSave();
          },
        }
        
        subProtocols[subProtocol]();
      },
    }
    
    //console.log(`Protocol is ${protocol} and subProtocol is ${subProtocol}`);

    //console.log(`Performing theme application with protocol ${protocol} and subProtocol ${subProtocol}`);
    protocols[protocol]();
    return response;
  }

  applyPadTheme(containerUI: string, themeUI?: string, strict?: boolean, confirmed: boolean = false): void {
    const subProtocol: string = (themeUI === '(none)') ? 'unsetTheme' : 'setTheme';
    const currentTheme: string = this.elements[containerUI].parsedCustomization.content['theme'];
    const currentThemeStrict: boolean = this.elements[containerUI].parsedCustomization.content['themeStrict'];
    const protocol: string = (confirmed || currentTheme === themeUI) ? 'confirmed' : 'unconfirmed';

    const protocols = {
      'unconfirmed': () => {
        const subProtocols = {
          'unsetTheme': () => {
            if (currentTheme === undefined) {return};
            let options = {
              'Cancel': () => {this.enableMode('confirmWithOptions',false)},
              'Unset Theme': () => {this.applyPadTheme(containerUI,themeUI,strict,true);this.enableMode('confirmWithOptions',false);this.enableMode('themeManager',false)},
            }
            this.confirmWithOptions(
              `Are you sure you want to unset this Container's Theme?`,
              options,
              `Removing Container Theme`,
              `24px`,
              `700px`,
            )
          },
          'setTheme': () => {
            let options = {
              'Cancel': () => {this.enableMode('confirmWithOptions',false)},
              'Apply' : () => {this.applyPadTheme(containerUI,themeUI,strict,true);this.enableMode('confirmWithOptions',false);this.enableMode('themeManager',false);},
            }
            this.confirmWithOptions(
              `Are you sure you want to apply this Theme to this Container?`,
              options,
            )
          },
        }

        subProtocols[subProtocol]();
      },
      'confirmed': () => {
        const subProtocols = {
          'unsetTheme': () => {
            this.elements[containerUI].customization['content:theme'] = undefined;
            this.elements[containerUI].customization['content:themeStrict'] = false;
            const customization = this.elements[containerUI].customization;
            this.fullParse(containerUI, customization, true);
          },
          'setTheme': () => {
            let theme;
            const fillUndefinedParametersAndGetTheme = () => {
              themeUI = (themeUI === undefined) ? currentTheme : themeUI;
              strict = (strict === undefined) ? currentThemeStrict : strict;
              theme = this.themes[themeUI];
            };

            const updateContainerCustomization = () => {
              this.elements[containerUI].customization['content:theme'] = themeUI;
              this.elements[containerUI].customization['content:themeStrict'] = false;
            }
    
            let elementUIs: Array<string>;
            const assembleListOfElementsAffected = () => {
              elementUIs = this.elements[containerUI].parsedCustomization.content['elementUIs'].filter(ui => {
                const element = this.elements[ui];
                if (element === undefined) {
                  //console.log(`Element ${ui} does not exists so it does not pass`);
                  return false;
                }
                const elementType: string = this.elements[ui].elementType;
                return (!theme.disabledTypes[elementType]) ? true : false;
              })
              elementUIs.push(containerUI);
            }
    
            const updateTemplatesOfElements = () => {
              elementUIs.forEach(ui => {
                if (strict) {
                  this.elements[ui].overrides = {};
                  this.elements[ui].disabled = {};
                  this.elements[ui].templateOverride = false;
                  this.elements[ui].defaultTemplate = false;
                }
                const elementType: string = (ui === 'masterContainer') ? 'background' : this.elements[ui].elementType;
                this.setTemplate(ui,theme.stylingTemplates[elementType],false,true);
              })
            }
    
            const saveElementStateAfterUpdate = () => {
              this.saveElements();
            }
    
            fillUndefinedParametersAndGetTheme();
            if (theme === undefined) {return};
            updateContainerCustomization();
            assembleListOfElementsAffected();
            updateTemplatesOfElements();
            saveElementStateAfterUpdate();
          },
        }

        subProtocols[subProtocol]();
      },
    };

    protocols[protocol]();
  }

  alphabetizedListByElementContentProperty(array: Array<string>, prop: string, requiredString?: string): Array<string> {
    const newAlphabetizedList: Array<string> = [];
    let newAlphabetizedPropertyList: Array<string> = [];
    array.forEach(ui => {
      const property = this.elements[ui].parsedCustomization.content[prop];
      const alphaObj = this.utility.pushAlphaAndLocate(newAlphabetizedPropertyList, property, true);
      newAlphabetizedPropertyList = alphaObj.array;
      if (requiredString === undefined || requiredString === '' || (requiredString != undefined && property.toLowerCase().indexOf(requiredString.toLowerCase()) != -1)) {
        newAlphabetizedList.splice(alphaObj.location, 0, ui);
      }
    })
    return newAlphabetizedList;
  }

  compareStrings(string1: string, string2: string): boolean {
    const string1Length: number = string1.length;
    const string2Length: number = string2.length;
    if (string1Length != string2Length) {
      return false;
    }
    let c1: string, c2: string;
    for (var i = 0; i < string1Length; i++) {
      c1 = string1[i].trim();
      c2 = string2[i].trim();
      //console.log(`Comparing characters "${c1}" and "${c2}"`);
      if (c1 != c2) {
        //console.log(`Different!`);
        return false;
      }
    }
    return true;
  }

  alphabetizedListByName(array: Array<string>, listType: string, requiredString?: string): Array<string> {
    requiredString = (requiredString != undefined) ? requiredString.toLowerCase() : requiredString;
    listType = (listType === 'template') ? 'template' : 'theme';
    const newAlphabetizedList: Array<string> = [];
    let newAlphabetizedPropertyList: Array<string> = [];
    array.forEach(ui => {
      const property = this[`${listType}s`][ui][`${listType}Name`].toLowerCase();
      const alphaObj = this.utility.pushAlphaAndLocate(newAlphabetizedPropertyList, property, true);
      newAlphabetizedPropertyList = alphaObj.array;
      if (requiredString === undefined || requiredString === '') {
        newAlphabetizedList.splice(alphaObj.location, 0, ui);
      } else {
        //console.log(`Looking for ${requiredString} in ${property}`);
        for (var i = 0; i + requiredString.length < property.length; i++) {
          const testPortion = property.substring(i, i+requiredString.length);
          //console.log(`Test portion is ${testPortion} and requiredString is ${requiredString}`);
          if (this.compareStrings(testPortion, requiredString)) {
            newAlphabetizedList.splice(alphaObj.location, 0, ui);
            //console.log(`Found at mark ${i}`);
            break;
          }
        }
        //console.log(`Done searching...`);
      }
    })
    return newAlphabetizedList;
  }

  newSearchText(event, searchType: string): void {
    //console.log(`New search event for ${event.currentTarget.innerText} and search type ${searchType}`);

    const text: string = event.currentTarget.innerText;
    const newList = this.alphabetizedListByName(this[`${searchType}UIList`], searchType, text);
    this[`${searchType}DisplayList`] = newList;
    /*
    const searchText: string = event.currentTarget.innerText.trim();
    const newUIList: Array<string> = this.flowService.assembleDisplayList(false);
    const newFilteredList: Array<string> = (searchText === '') ? newUIList : this.filterDisplayListBySearch(searchText, false, newUIList);
    const newAlphabetizedList = this.alphabetizedListByElementContentProperty(newFilteredList,'title');
    this.flowService.displayUIList = newAlphabetizedList;
    */
  }
  
  setSearchText(text: string, searchType: string): void {
    //console.log(`Setting and trimming search text`);
    const elementId = (searchType === 'template') ? 'manager-search-input-div' : 'theme-manager-search-input-div';
    const element = document.getElementById(elementId);
    if (element != undefined && element != null) {
      element.innerText = text.trim();
    }
    this.forms.managerSearch.patchValue({
      [searchType]: text,
    })
    const mockEvent = {
      currentTarget: {
        innerText: text
      }
    }
    this.newSearchText(mockEvent, searchType);
  }
}