import { Component, OnInit } from '@angular/core';
import { AlertOverlayService } from '../../services/alert-overlay/alert-overlay.service';
import { CcViewService } from '../../services/cc-view/cc-view.service';
import { ElementService } from '../../services/element/element.service';

interface FlexInputInfo { 
  name: String, 
  type: String, 
  initialValue: String,
  customizationGridArea?,
  typeOptions?
};

interface ButtonInfo {
  text: String,
  action: Function
};

interface ButtonObject {
  submit: ButtonInfo,
  cancel: ButtonInfo,
  close: ButtonInfo
};

interface CategoryInfo {
  name: String,
  categoryStyling,
  categoryMasterStyling,
  customizationArray: FlexInputInfo[],
  verticalCover?: boolean
};

interface CustomizationBoxInfo {
  boxStyling,
  name: String, 
  categoryArray: CategoryInfo[],
  buttonObject: ButtonObject
};

@Component({
  selector: 'app-cc-view',
  templateUrl: './cc-view.component.html',
  styleUrls: ['./cc-view.component.sass']
})
export class CcViewComponent implements OnInit {

  public dropDownOpen: boolean = false;
  public dropDownChoice: string;

  public hovering = {};

  public choices = {
    fontSizes: [
      '12px',
      '14px',
      '16px',
      '20px',
      '24px',
      '30px',
      '36px',
    ],
    fontStyles: [
      'bold',
      'normal',
      'italic',
    ],
    borderWidths: [
      '0px',
      '1px',
      '2px',
      '3px',
      '4px',
      '5px',
      '6px',
      '7px',
      '8px',
    ],
    borderStyles: [
      'solid',
      'double',
      'dashed',
      'dotted',
      'ridge',
      'groove',
      'outset',
    ],
    borderRadii: [
      '0px',
      '5px',
      '10px',
      '15px',
      '20px',
      '25px',
      '30px',
    ],
    shadowSpreads: [
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
    ],
    shadowBlurs: [
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
    ],
    shadowOffsets: [
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
    ],
    shadowInsets: [
      'inset',
      'outset',
    ],
    listItemSizes: [
      'small',
      'medium',
      'large',
      'x-large',
    ],
    checkboxIcons: [
      'X',
      '&#10003;',
    ],
  };

  public openDD = {
  };

  public headers = {
    newCustomization: "Element Customization",
    templateEdit: "Template Customization",
    themeEdit: "Theme Customization"
  };

  public formGroups = {
    newCustomization: 'convertedCustomization',
    templateEdit: 'convertedCustomization',
    themeEdit: 'newThemeEditor'
  };

  public customizationChecks = {
    checklist: () => {
      const modeIsNotTemplateEdit = this.ccView.mode !== 'templateEdit';

      const { ccViewUI } = this.ccView;
      const element = this.elementService.elements[ccViewUI] || {};
      const elementIsChecklist = element.elementType === 'checklist';

      return modeIsNotTemplateEdit && elementIsChecklist;
    },
    templateEdit: () => {
      const modeIsTemplateEdit = this.ccView.mode === 'templateEdit';

      return modeIsTemplateEdit;
    },
    container: () => {
      const { ccViewUI } = this.ccView;
      const element = this.elementService.elements[ccViewUI] || {};
      const elementIsContainer = element.elementType === 'container';

      return elementIsContainer;
    }
  };

  private untouchedOpenDD;
  public newCustomizationBoxInfo: CustomizationBoxInfo;

  constructor(
    public ccView: CcViewService,
    public elementService: ElementService,
  ) {
    this.untouchedOpenDD = Object.assign({}, this.openDD);

    window.onresize = () => {
      this.ccView.checkMobile();
    }
    
    this.newCustomizationBoxInfo = this.constructCustomizationBoxWrapper(
      "Test Customization Box 2",
      "The Customizer",
      { rowSize: 80, colSize: 100 });
  }

  ngOnInit(): void {
    this.ccView.checkMobile();
  }

  setHovering(tagName: string, state: boolean) {
    this.hovering[tagName] = state;
  }

  closeOtherDropDowns(open?: string): void {
    const newOpenDD = Object.assign({}, this.untouchedOpenDD);
    newOpenDD[open] = true;
    this.openDD = newOpenDD;
  }

  constructCustomizationBoxWrapper(name, headerText, { rowSize: gridAutoRows, colSize: gridAutoColumns }) {
    const createPxArray = array => array.map(item => `${parseInt(item)}px`);
    const createPx = item => `${parseInt(item)}px`;
    const createDropdownArray = (preProcess = item => item, array = []) => {
      return array.map(item => ({ value: preProcess(item), text: preProcess(item) }));
    };
    const createGridTemplateAreas = complexArray => complexArray.map(row => `"${row.join(" ")}"`).join(" ");
    const createButtonObject = (text, action) => ({ text, action });
    const createGridStyling = (additionalStyling) => ({
      display: "grid",
      gridAutoRows: `${gridAutoRows}px`,
      gridAutoColumns: `${gridAutoColumns}px`,
      ...additionalStyling
    });
    const createCategoryStyling = (additionalStyling) => ({
      display: "grid",
      gridAutoRows: "1fr",
      gridAutoColumns: "1fr",
      ...additionalStyling
    });
    
    const testGridTemplateArea = [
      (new Array(4)).fill('header'),
      ['theme', 'theme', 'template', 'template'],
      (new Array(4)).fill('content'),
      ['font', 'font', 'border', 'border'],
      ['font', 'font', 'border', 'border'],
      ['shadow', 'shadow', 'shadow', 'background'],
      ['shadow', 'shadow', 'shadow', 'background'],
      ['checkbox', 'list-items', 'list-items', 'list-items'],
      ['checkbox', 'list-items', 'list-items', 'list-items']
    ];

    const gridTemplateAreas = createGridTemplateAreas(testGridTemplateArea);

    const boxStyling = createGridStyling({
      gridTemplateRows: "50px",
      gridTemplateAreas
    });

    const buttonObject = {
      submit: createButtonObject("Submit", () => console.log("Submitting customization box")),
      cancel: createButtonObject("Cancel", () => console.log("Cancelling customization box")),
      close: createButtonObject("X", () => console.log("Closing customization box"))
    };

    console.log(createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index)));

    const categoryArray: CategoryInfo[] = [
      {
        name: "Theme",
        categoryMasterStyling: {
          gridArea: "theme",
          borderBottom: "2px solid #555555",
          borderRight: "2px solid #555555"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['theme-dropdown']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "theme-dropdown"
            },
            name: "Theme",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "test-theme-1", text: "Test Theme 1" },
                { value: "test-theme-2", text: "Test Theme 2" },
                { value: "test-theme-3", text: "Test Theme 3" },
                { value: "test-theme-4", text: "Test Theme 4" },
                { value: "test-theme-5", text: "Test Theme 5" }
              ]
            },
            initialValue: "test-theme-1"
          }
        ]
      },{
        name: "Template",
        categoryMasterStyling: {
          gridArea: "template",
          borderBottom: "2px solid #555555"
        },
        categoryStyling: { gridTemplateAreas: createGridTemplateAreas([new Array(2).fill('template-dropdown')]) },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "template-dropdown"
            },
            name: "Template",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "test-template-1", text: "Test Template 1" },
                { value: "test-template-2", text: "Test Template 2" },
                { value: "test-template-3", text: "Test Template 3" },
                { value: "test-template-4", text: "Test Template 4" },
                { value: "test-template-5", text: "Test Template 5" }
              ]
            },
            initialValue: "test-template-1"
          }
        ]
      },{
        name: "Content",
        categoryMasterStyling: {
          gridArea: "content",
          borderBottom: "2px solid #555555"
        },
        categoryStyling: { gridTemplateAreas: createGridTemplateAreas([new Array(4).fill('content-link')]) },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "content-link"
            },
            name: "Link",
            type: "text",
            initialValue: "https://www.duckduckgo.com"
          }
        ]
      },{
        name: "Font",
        categoryMasterStyling: {
          gridArea: "font",
          borderBottom: "2px solid #555555",
          borderRight: "2px solid #555555"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['color', 'size'],['style', 'family']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "color"
            },
            name: "Color",
            type: "color",
            initialValue: "#000000"
          },{
            customizationGridArea: {
              gridArea: "size"
            },
            name: "Size",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(12)).fill(undefined).map((item, index) => 12 + (index * 2)))
            },
            initialValue: "24px"
          },{
            customizationGridArea: {
              gridArea: "family"
            },
            name: "Family",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(item => item, [
                "Times New Roman",
                "Courier",
                "Roboto",
                "Segue UI"
              ])
            },
            initialValue: "Times New Roman"
          },{
            customizationGridArea: {
              gridArea: "style"
            },
            name: "Style",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "normal", text: "Normal" },
                { value: "bold", text: "Bold" },
                { value: "italic", text: "Italic" }
              ]
            },
            initialValue: "normal"
          }
        ]
      },{
        name: "Border",
        categoryMasterStyling: {
          gridArea: "border",
          borderBottom: "2px solid #555555"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['color', 'width'],['style', 'radius']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "color"
            },
            name: "Color",
            type: "color",
            initialValue: "#000000"
          },{
            customizationGridArea: {
              gridArea: "width"
            },
            name: "Width",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(7)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "3px"
          },{
            customizationGridArea: {
              gridArea: "style"
            },
            name: "Style",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "solid", text: "Solid" },
                { value: "double", text: "Double" },
                { value: "dotted", text: "Dotted" },
                { value: "dashed", text: "Dashed" },
                { value: "groove", text: "Groove" }
              ]
            },
            initialValue: "solid"
          },{
            customizationGridArea: {
              gridArea: "radius"
            },
            name: "Radius",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "0px"
          }
        ]
      },{
        name: "Background",
        verticalCover: true,
        categoryMasterStyling: {
          gridArea: "background",
          borderBottom: "2px solid #555555"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['color'], ['image']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "color"
            },
            name: "Color",
            type: "color",
            initialValue: "#ffffff"
          },{
            customizationGridArea: {
              gridArea: "image"
            },
            name: "Image",
            type: "text",
            initialValue: ""
          }
        ]
      },{
        name: "Shadow",
        categoryMasterStyling: {
          gridArea: "shadow",
          borderBottom: "2px solid #555555",
          borderRight: "2px solid #555555"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['color', 'spread', 'blur'], ['x-offset', 'y-offset', 'inset']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "color"
            },
            name: "Color",
            type: "color",
            initialValue: "#ffffff"
          },{
            customizationGridArea: {
              gridArea: "spread"
            },
            name: "Spread",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "0px"
          },{
            customizationGridArea: {
              gridArea: "blur"
            },
            name: "Blur",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "0px"
          },{
            customizationGridArea: {
              gridArea: "x-offset"
            },
            name: "X Offset",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "0px"
          },{
            customizationGridArea: {
              gridArea: "y-offset"
            },
            name: "Y Offset",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "0px"
          },{
            customizationGridArea: {
              gridArea: "inset"
            },
            name: "Inset",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "inset", text: "Inset" },
                { value: "outset", text: "Outset" }
              ]
            },
            initialValue: "0px"
          }
        ]
      },{
        name: "List Items",
        categoryMasterStyling: {
          gridArea: "list-items"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['font-color', 'background', 'size'], ['border-color', 'border-width', 'border-style']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "font-color"
            },
            name: "Font Color",
            type: "color",
            initialValue: "#000000"
          },{
            customizationGridArea: {
              gridArea: "background"
            },
            name: "Background",
            type: "color",
            initialValue: "#ffffff"
          },{
            customizationGridArea: {
              gridArea: "size"
            },
            name: "Size",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "small", text: "Small" },
                { value: "medium", text: "Medium" },
                { value: "large", text: "Large" },
                { value: "x-large", text: "Extra Large" }
              ]
            },
            initialValue: "normal"
          },{
            customizationGridArea: {
              gridArea: "border-color"
            },
            name: "Border Color",
            type: "color",
            initialValue: "#ffffff"
          },{
            customizationGridArea: {
              gridArea: "border-width"
            },
            name: "Border Width",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: createDropdownArray(createPx, (new Array(11)).fill(undefined).map((item, index) => 0 + index))
            },
            initialValue: "0px"
          },{
            customizationGridArea: {
              gridArea: "border-style"
            },
            name: "Border Style",
            type: "dropdown",
            typeOptions: {
              dropdownChoices: [
                { value: "solid", text: "Solid" },
                { value: "double", text: "Double" },
                { value: "dotted", text: "Dotted" },
                { value: "dashed", text: "Dashed" },
                { value: "groove", text: "Groove" }
              ]
            },
            initialValue: "#ffffff"
          }
        ]
      },{
        name: "Checkbox",
        verticalCover: true,
        categoryMasterStyling: {
          gridArea: "checkbox",
          borderRight: "2px solid #555555"
        },
        categoryStyling: { 
          gridTemplateAreas: createGridTemplateAreas([['icon'], ['color']])
        },
        customizationArray: [
          {
            customizationGridArea: {
              gridArea: "icon"
            },
            name: "Icon",
            type: "text",
            initialValue: "X"
          },{
            customizationGridArea: {
              gridArea: "color"
            },
            name: "Background",
            type: "color",
            initialValue: "#ffffff"
          }
        ]
      }
    ];

    const newCustomizationBoxInfo = {
      headerText,
      name,
      buttonObject,
      categoryArray,
      boxStyling
    };

    console.log(newCustomizationBoxInfo);

    return newCustomizationBoxInfo;
  }
}
