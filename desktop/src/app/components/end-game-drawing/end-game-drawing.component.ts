import { Component, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';

@Component({
  selector: 'app-end-game-drawing',
  templateUrl: './end-game-drawing.component.html',
  styleUrls: ['./end-game-drawing.component.scss']
})
export class EndGameDrawingComponent implements OnInit {

  virtualPlayerDrawings: string[] = [];
  realPlayerDrawings: string[] = [];

  constructor(private gameService: GameService) {
    this.virtualPlayerDrawings = this.gameService.virtualPlayerDrawings;
    this.realPlayerDrawings = this.realPlayerDrawings;
    console.log(this.virtualPlayerDrawings);
   }

  ngOnInit(): void {
  }

  upVote(): void {
    console.log('upvote')
  }

  downVote(): void {
    console.log('downVote')
  }

  quit(): void {
    console.log('quit')
  }

}
