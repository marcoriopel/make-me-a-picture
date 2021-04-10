import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { SearchGameService } from '@app/services/search-game/search-game.service'

@Component({
  selector: 'app-game-bar',
  templateUrl: './game-bar.component.html',
  styleUrls: ['./game-bar.component.scss']
})
export class GameBarComponent {

  @ViewChild("classic") classicButtonRef: ElementRef;
  @ViewChild("solo") soloButtonRef: ElementRef;
  @ViewChild("coop") coopButtonRef: ElementRef;
  soloOpen: boolean = false;
  coopOpen: boolean = false;
  classicOpen: boolean = false;

  sprintImgRef: string = "./assets/img/sprintLogo.png";
  coopImgRef: string = "./assets/img/hands-helping-solid.svg";
  classicBlackImgRef: string =  "./assets/img/classicLogoBlack.png";

  constructor(public searchGameService: SearchGameService, private renderer: Renderer2) { }

  displayGameMenu(game: string): void{
    this.closeAll();
    switch(game) {
      case "solo":
        if (this.soloOpen) 
          this.renderer.removeClass(this.soloButtonRef.nativeElement, "button-expanded");
        else 
          this.renderer.addClass(this.soloButtonRef.nativeElement, "button-expanded");
        this.soloOpen = !this.soloOpen;
        this.coopOpen = false;
        this.classicOpen = false;
        break;
      case "coop":
        if (this.coopOpen) 
          this.renderer.removeClass(this.coopButtonRef.nativeElement, "button-expanded");
        else 
          this.renderer.addClass(this.coopButtonRef.nativeElement, "button-expanded");
        this.coopOpen = !this.coopOpen;
        this.soloOpen = false;
        this.classicOpen = false;
        break;
      case "classic":
        if (this.classicOpen) 
          this.renderer.removeClass(this.classicButtonRef.nativeElement, "button-expanded");
        else 
          this.renderer.addClass(this.classicButtonRef.nativeElement, "button-expanded");
        this.classicOpen = !this.classicOpen;
        this.soloOpen = false;
        this.coopOpen = false;
        break
    }
  }
  
  closeAll(): void {
    this.renderer.removeClass(this.soloButtonRef.nativeElement, "button-expanded");
    this.renderer.removeClass(this.coopButtonRef.nativeElement, "button-expanded");
    this.renderer.removeClass(this.classicButtonRef.nativeElement, "button-expanded");
  }
}
