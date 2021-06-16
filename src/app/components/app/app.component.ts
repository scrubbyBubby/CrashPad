import { Component } from '@angular/core';
import {Location, LocationStrategy, HashLocationStrategy} from '@angular/common';

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

document.addEventListener('mousedown', function (event) {
  if (event.detail > 1) {
    event.preventDefault();
    // of course, you still do not know what you prevent here...
    // You could also check event.ctrlKey/event.shiftKey/event.altKey
    // to not prevent something useful.
  }
}, false);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  providers: [
    Location, {provide: LocationStrategy, useClass: HashLocationStrategy}
  ]
})
export class AppComponent {
  location: Location;
  customizationBoxInfo: CustomizationBoxInfo;
  newCustomizationBoxInfo: CustomizationBoxInfo;
  constructor(location: Location) { 
    this.location = location;
    this.customizationBoxInfo = this.constructCustomizationBoxInfo('Test Customization Box');
    this.newCustomizationBoxInfo = this.constructCustomizationBoxWrapper(
      "Test Customization Box 2",
      "The Customizer",
      { rowSize: 80, colSize: 100 }, 
      this.getCustomizationCategoryArray());
  };

  title = 'crash-pad';

  public typeOptions: { dropdownChoices: { value: String, text: String }[] } = {
    dropdownChoices: [
      { value: "Test1", text: "Test 1" },
      { value: "Test2", text: "Test 2" },
      { value: "Test3", text: "Test 3" },
      { value: "Test4", text: "Test 4" },
      { value: "Test5", text: "Test 5" }
    ]
  };

  public testAlert: Function = (event) => {
    console.dir(event);
  };

  public flexInputInfo = {
    name: "Pad Title",
    type: "dropdown",
    typeOptions: {
      dropdownChoices: [
        { value: "Test1", text: "Test 1" },
        { value: "Test2", text: "Test 2" },
        { value: "Test3", text: "Test 3" },
        { value: "Test4", text: "Test 4" },
        { value: "Test5", text: "Test 5" }
      ]
    },
    initialValue: "Test1"
  };

  public flexInputInfoText = {
    name: "Pad Title",
    type: "text",
    initialValue: "Testing"
  };
  
  public flexInputInfoColor = {
    name: "Pad Title",
    type: "color",
    initialValue: "#000000"
  };
  
  public flexInputInfoDropdown = {
    name: "Pad Title",
    type: "dropdown",
    typeoptions: {
      dropdownChoices: [
        { value: "Test1", text: "Test 1" },
        { value: "Test2", text: "Test 2" },
        { value: "Test3", text: "Test 3" },
        { value: "Test4", text: "Test 4" },
        { value: "Test5", text: "Test 5" }
      ]
    },
    initialValue: "Test1"
  };

  public categoryInfo: CategoryInfo = {
    name: "Test Category",
    categoryMasterStyling: {},
    categoryStyling: {},
    customizationArray: [ {
      name: "Text",
      type: "text",
      initialValue: "Testing"
    }, {
      name: "Color",
      type: "color",
      initialValue: "#000000"
    }, {
      name: "Dropdown",
      type: "dropdown",
      typeOptions: {
        dropdownChoices: [
          { value: "Test1", text: "Test 1" },
          { value: "Test2", text: "Test 2" },
          { value: "Test3", text: "Test 3" },
          { value: "Test4", text: "Test 4" },
          { value: "Test5", text: "Test 5" }
        ]
      },
      initialValue: "Test1"
    } ]
  };

  public testCustomizationCategoryStyling = {
    border: "2px solid #555555",
    boxSizing: "border-box"
  };

  constructComplexString(matrix) {
    return matrix.reduce((complexString, row) => {
      const baseString: String = (complexString === "") ? "" : `${complexString.trim()} `;
      return `${baseString}"${row.join(" ")}"`;
    }, "");
  }

  constructCustomizationBoxInfo(customizationBoxName) {
    const buttonObject = {
      submit: {
        text: "Submit",
        action: () => {
          console.log('Submitting customization box');
        }
      },
      cancel: {
        text: "Cancel",
        action: () => {
          console.log('Cancelling customization box');
        }
      },
      close: {
        text: "X",
        action: () => {
          console.log('Closing customization box');
        }
      }
    };

    return {
      headerText: "Customization Box",
      boxStyling: {
        display: "grid",
        gridAutoRows: "100px",
        gridAutoColumns: "100px",
        gridTemplateRows: '50px',
        gridTemplateAreas: `"header header header" "test-cat-1 test-cat-1 test-cat-1" "test-cat-2 test-cat-2 test-cat-2" "test-cat-3 test-cat-3 test-cat-3"`
      },
      name: customizationBoxName,
      categoryArray: [
        this.constructCustomizationCategoryInfo('Test Category 1', 'test-cat-1', {
          borderBottom: "2px solid #555555"
        }),
        this.constructCustomizationCategoryInfo('Test Category 2', 'test-cat-2', {
          borderBottom: "2px solid #555555"
        }),
        this.constructCustomizationCategoryInfo('Test Category 3', 'test-cat-3', {
          
        })
      ],
      buttonObject
    }
  }


  handleChangedValue(evt): void {
    console.log(evt);
  }
  
  handleChangedFocus(evt): void {
    console.log(evt);
  }

  constructCustomizationCategoryInfo(name, gridAreaName, masterStyling = {}) {
    console.log(this.constructComplexString([['color-1', 'color-1', 'dropdown-1']]));
    return {
      name,
      categoryMasterStyling: {
        ...masterStyling,
        'gridArea': gridAreaName
      },
      categoryStyling: {
        display: "grid",
        gridTemplateAreas: this.constructComplexString([['color-1', 'text-1', 'dropdown-1']]),
        gridAutoRows: "100px",
        gridAutoColumns: "100px"
      },
      customizationArray: [
        {
          customizationGridArea: {
            gridArea: "text-1"
          },
          name: "Text",
          type: "text",
          initialValue: "Testing"
        },{
          customizationGridArea: {
            gridArea: "color-1"
          },
          name: "Color",
          type: "color",
          initialValue: "#000000"
        },{
          customizationGridArea: {
            gridArea: "dropdown-1"
          },
          name: "Dropdown",
          type: "dropdown",
          typeOptions: {
            dropdownChoices: [
              { value: "Test1", text: "Test 1" },
              { value: "Test2", text: "Test 2" },
              { value: "Test3", text: "Test 3" },
              { value: "Test4", text: "Test 4" },
              { value: "Test5", text: "Test 5" }
            ]
          },
          initialValue: "Test1"
        }
      ]
    }
  }

  getCustomizationCategoryArray() {
    const createPx = item => `${parseInt(item)}px`;
    const createDropdownArray = (preProcess = item => item, array = []) => {
      return array.map(item => ({ value: preProcess(item), text: preProcess(item) }));
    };
    const createGridTemplateAreas = complexArray => complexArray.map(row => `"${row.join(" ")}"`).join(" ");

    const borderStyle = "2px solid #555555";

    const createCategoryMasterStyling = (gridArea: string, borders, borderStyle: string) => {
      const masterStyling = {
        gridArea
      };
      const borderTypes = ['left', 'right', 'top', 'bottom'];
      const borderMap = {
        left: 'borderLeft',
        right: 'borderRight',
        top: 'borderTop',
        bottom: 'borderBottom'
      };

      borderTypes.forEach(type => {
        if (borders[type]) {
          masterStyling[borderMap[type]] = borderStyle;
        }
      });

      return masterStyling;
    };

    const categoryArray: CategoryInfo[] = [
      {
        name: "Theme",
        categoryMasterStyling: createCategoryMasterStyling('theme', {bottom: true, right: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('template', {bottom: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('content', {bottom: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('font', {bottom: true, right: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('border', {bottom: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('background', {bottom: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('shadow', {bottom: true, right: true}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('list-items', {}, borderStyle),
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
        categoryMasterStyling: createCategoryMasterStyling('checkbox', {right: true}, borderStyle),
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
    return categoryArray;
  }

  constructCustomizationBoxWrapper(name, headerText, { rowSize: gridAutoRows, colSize: gridAutoColumns }, categoryArray) {
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

    const newCustomizationBoxInfo = {
      headerText,
      name,
      buttonObject,
      categoryArray,
      boxStyling
    };

    console.log(newCustomizationBoxInfo);

    return newCustomizationBoxInfo;
  };
}
