import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularDraggableModule } from 'angular2-draggable';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ContainerComponent } from './container/container.component';
import { FirstUpperCasePipe } from './first-upper-case.pipe';
import { LinkComponent } from './link/link.component';
import { PeelNumberPipe } from './peel-number.pipe';
import { TemplateManagerComponent } from './template-manager/template-manager.component';
import { CcViewComponent } from './cc-view/cc-view.component';
import { NewElementComponent } from './new-element/new-element.component';
import { MultilinkComponent } from './multilink/multilink.component';
import { NoteComponent } from './note/note.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { AlertOverlayComponent } from './alert-overlay/alert-overlay.component';
import { MenuControlsComponent } from './menu-controls/menu-controls.component';
import { DropDownComponent } from './drop-down/drop-down.component';
import { ToolTipComponent } from './tool-tip/tool-tip.component';

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
