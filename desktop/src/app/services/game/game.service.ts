import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  isInGame: boolean = false;
  score: number[] = [0,0];
  drawingPlayer: string;
  gameId: string;
  username: string | null;
  drawingName: string = "";

  constructor(private socketService: SocketService, private router: Router) { 
    this.username = localStorage.getItem('username');
  }

  initialize(): void {
    this.socketService.bind('gameStart', (data: any) => {
      this.isInGame = true;
      this.drawingPlayer = data.player;
      this.router.navigate(['/game']);
    })

    this.socketService.bind('score', (data: any) => {
      this.score = data.score;
    })

    this.socketService.bind('drawingName', (data: any) => {
      this.drawingName = data.drawingName;
      console.log(data);
    })
  }
}
