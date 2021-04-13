import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar-icon',
  templateUrl: './avatar-icon.component.html',
  styleUrls: ['./avatar-icon.component.scss']
})
export class AvatarIconComponent implements OnInit {

  @Input() avatar : string;
  avatarImgRef : string = "./assets/img/";

  constructor() { }

  ngOnInit(): void {
    switch(parseInt(this.avatar)){
      case 0 :
        this.avatarImgRef += "avatar0.png"
        break;
      case 1 :
        this.avatarImgRef += "avatar1.png"
        break;
      case 2 :
        this.avatarImgRef += "avatar2.png"
        break;
      case 3 :
        this.avatarImgRef += "avatar3.png"
        break;
      case 4 :
        this.avatarImgRef += "avatar4.png"
        break;
      case 5 :
        this.avatarImgRef += "avatar5.png"
        break;
      case 6 :
        this.avatarImgRef += "profileVPlayer1.png"
        break;
      case 7 :
        this.avatarImgRef += "profileVPlayer2.png"
        break;
      case 8 :
        this.avatarImgRef += "profileVPlayer3.png"
        break;
      case 9 :
        this.avatarImgRef += "profileVPlayer4.png"
        break;
      default:
        this.avatarImgRef += "SystemUserIcon.png"
    }
  }

}
