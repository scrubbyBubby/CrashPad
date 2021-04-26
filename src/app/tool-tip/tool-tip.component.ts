import { Component, OnInit } from '@angular/core';
import { ElementService } from '../element.service';
import { ToolTipService } from '../tool-tip.service';

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
