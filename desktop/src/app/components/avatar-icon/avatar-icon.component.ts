import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar-icon',
  templateUrl: './avatar-icon.component.html',
  styleUrls: ['./avatar-icon.component.scss']
})
export class AvatarIconComponent implements OnInit {

  @Input() avatar : number;
  avatarImgRef : string = "../../../assets/img/";

  constructor() { }

  ngOnInit(): void {
    console.log(typeof(this.avatar));
    switch(this.avatar){
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
      default:
        this.avatarImgRef += "profileIcon.png"
    }
  }

}
