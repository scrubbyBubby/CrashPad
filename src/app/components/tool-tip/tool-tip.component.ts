import { Component, OnInit } from '@angular/core';
import { ElementService } from '../../services/element/element.service';
import { ToolTipService } from '../../services/tool-tip/tool-tip.service';

@Component({
  selector: 'app-tool-tip',
  templateUrl: './tool-tip.component.html',
  styleUrls: ['./tool-tip.component.sass']
})
export class ToolTipComponent implements OnInit {

  constructor(
    public service: ToolTipService,
    public elementService: ElementService,
  ) { }

  ngOnInit(): void {
  }

}
