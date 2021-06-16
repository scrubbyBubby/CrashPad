import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularDraggableModule } from 'angular2-draggable';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from '../components/app/app.component';
import { MainViewComponent } from '../components/main-view/main-view.component';
import { ContainerComponent } from '../components/container/container.component';
import { FirstUpperCasePipe } from '../pipes/first-upper-case/first-upper-case.pipe';
import { LinkComponent } from '../components/link/link.component';
import { PeelNumberPipe } from '../pipes/peel-number/peel-number.pipe';
import { TemplateManagerComponent } from '../components/template-manager/template-manager.component';
import { CcViewComponent } from '../components/cc-view/cc-view.component';
import { NewElementComponent } from '../components/new-element/new-element.component';
import { MultilinkComponent } from '../components/multilink/multilink.component';
import { NoteComponent } from '../components/note/note.component';
import { ChecklistComponent } from '../components/checklist/checklist.component';
import { AlertOverlayComponent } from '../components/alert-overlay/alert-overlay.component';
import { MenuControlsComponent } from '../components/menu-controls/menu-controls.component';
import { DropDownComponent } from '../components/drop-down/drop-down.component';
import { ToolTipComponent } from '../components/tool-tip/tool-tip.component';
import { FlexInputComponent } from '../components/flex-input/flex-input.component';
import { CustomizationCategoryComponent } from '../components/customization-category/customization-category.component';
import { CustomizationBoxComponent } from '../components/customization-box/customization-box.component';

@NgModule({
  declarations: [
    AppComponent,
    MainViewComponent,
    ContainerComponent,
    FirstUpperCasePipe,
    LinkComponent,
    PeelNumberPipe,
    TemplateManagerComponent,
    CcViewComponent,
    NewElementComponent,
    MultilinkComponent,
    NoteComponent,
    ChecklistComponent,
    AlertOverlayComponent,
    MenuControlsComponent,
    DropDownComponent,
    ToolTipComponent,
    FlexInputComponent,
    CustomizationCategoryComponent,
    CustomizationBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularDraggableModule,
    ReactiveFormsModule,
    DragDropModule,
    ScrollingModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
