import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  score: number[];
  drawingPlayer: string;
  gameId: string;

  constructor(private socketService: SocketService, private router: Router) { }

  initialize(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.drawingPlayer = data.player;
      this.router.navigate(['/game']);
    })

    this.socketService.bind('score', (data: any) => {
      this.score = data.score;
    })
  }
}
