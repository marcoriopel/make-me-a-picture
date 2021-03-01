import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { SearchGameService } from '@app/services/search-game/search-game.service';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-game-preview',
  templateUrl: './game-preview.component.html',
  styleUrls: ['./game-preview.component.scss'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ height: 35, opacity: 0 }),
            animate('1s ease-out', 
                    style({ height: 35, opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 300, opacity: 1 }),
            animate('1s ease-in', 
                    style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class GamePreviewComponent{

  classicGreyImgRef: string = "../../../assets/img/classicLogoWhite.png"
  sprintImgRef: string = "../../../assets/img/sprintLogo.png";

  @ViewChild("gamePreview") gamePreviewRef: ElementRef;

  @Input() name: string;
  @Input() type: string;
  @Input() id: string;

  isPreview: boolean = false;

  constructor(private searchGameService: SearchGameService, private renderer: Renderer2) { }

  preview() {
    if (this.isPreview)
      this.renderer.removeClass(this.gamePreviewRef.nativeElement, "game-preview");
    else
      this.renderer.addClass(this.gamePreviewRef.nativeElement, "game-preview");
    this.isPreview = !this.isPreview;

  }

  join(id: string) {
    this.searchGameService.joint(id);
  }

}
