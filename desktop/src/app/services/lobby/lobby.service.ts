import { Injectable } from '@angular/core';
import { NewGame, Game ,GameType, Difficulty } from '@app/classes/game';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ACCESS } from '@app/classes/acces';
import { io, Socket } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  
  // Attribute
  game: Game;
  username = localStorage.getItem('username');
  virtalPlayer1: string | null = null;
  virtalPlayer2: string | null = null;
  team1Full: boolean = false;
  isTeam2Full: boolean = false;
  isLobbyFull: boolean = false;

  // Socket
  private socket: Socket;

  // URL
  private baseUrl = environment.api_url;
  private createGameUrl = this.baseUrl + "/api/games/create";
  private joinUrl = this.baseUrl + "/api/games/joinLobby";


  constructor(private http: HttpClient) {
    this.game = {
      id: "1234567890",
      name: "Game 1",
      type: GameType.Classic,
      difficulty: Difficulty.Normal,
      player: ["Marc", "Gui"],
      team1: ["Marc"],
      team2: []
    }
    const jwt = localStorage.getItem(ACCESS.TOKEN) as string;
    this.socket = io("http://18.217.235.167:3000/", {
      extraHeaders: {
        "authorization": jwt
      }
    });
  }

  private isFull(): void {
    if (this.game.type == GameType.Classic) {
      this.team1Full = (this.game.team1.length < 2) ? false: true;
      this.isTeam2Full = (this.game.team2.length < 2) ? false: true;
      this.isLobbyFull = this.team1Full && this.isTeam2Full;
    } else {
      this.team1Full = (this.game.team1.length < 4) ? false: true;
      this.isLobbyFull = this.team1Full;
    }
  }

  joinTeam(team: number): void {
    switch(team) {
      case 1:
        if (this.game.team1.length < 2 && this.game.team1.indexOf(this.username!, 0) < 0) {
          this.game.team1.push(this.username!)
          const index = this.game.team2.indexOf(this.username!, 0);
          if (index > -1) {
            this.game.team2.splice(index, 1);
          }
        }
        break;
      case 2:
        console.log(this.game.team2)
        if (this.game.team2.length < 2 && this.game.team2.indexOf(this.username!, 0) < 0) {
          this.game.team2.push(this.username!)
          const index = this.game.team1.indexOf(this.username!, 0);
          if (index > -1) {
            this.game.team1.splice(index, 1);
          }
        }
        break;
    }
    this.isFull();
  }

  toggleVirtualPlayer(team: number): void {
    switch(team) {
      case 1: 
        if (this.virtalPlayer1 == null) {
          this.virtalPlayer1 = "Virtuel";
          this.game.team1.push(this.virtalPlayer1);
        } else {
          this.game.team1.splice(this.game.team1.indexOf(this.virtalPlayer1!, 0), 1);
          this.virtalPlayer1 = null
        }
        break;
      case 2:
        if (this.virtalPlayer2 == null) {
          this.virtalPlayer2 = "Virtuel";
          this.game.team2.push(this.virtalPlayer2);
        } else {
          this.game.team2.splice(this.game.team2.indexOf(this.virtalPlayer2!, 0), 1);
          this.virtalPlayer2 = null
        }
        break;
    }
    this.isFull();
  }

  start(): void {
    throw new Error('Method not implemented.');
  }

  create(game: NewGame) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    return this.http.post<any>(this.createGameUrl, game, options);
  }

  join(id: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'authorization': localStorage.getItem(ACCESS.TOKEN)!});
    const options = { headers: headers };
    return this.http.post<any>(this.joinUrl, {lobbyId: id}, options).subscribe(
      res => {
        console.log(res);
        this.socket.emit("listenLobby", {"oldLobbyId": "", "lobbyId": id});
        console.log('test')

      },
      err => {
        console.log('erro')
        console.log(err);
      }
    );
  }

}
