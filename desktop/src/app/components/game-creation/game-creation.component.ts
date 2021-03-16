import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameType, NewGame } from '@app/classes/game';
import { GameService } from '@app/services/game/game.service';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { errorMessages } from '../register/custom-validator';
import { SocketService } from '@app/services/socket/socket.service';

@Component({
  selector: 'app-game-creation',
  templateUrl: './game-creation.component.html',
  styleUrls: ['./game-creation.component.scss'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({opacity: 0 }),
            animate('1.5s ease-out', 
                    style({opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({opacity: 1 }),
            animate('0.5s ease-in', 
                    style({opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class GameCreationComponent implements OnInit {

  @Input() type: GameType;

  gameForm: FormGroup;
  errors = errorMessages;
  private onlySpaceRegExp = /^\s+$/;

  constructor(private fb: FormBuilder, private lobbyService: LobbyService, private gameService: GameService, private router: Router, private socketService: SocketService) { }

  ngOnInit(): void {
    this.gameForm = this.fb.group({
      name: [ '', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(16)
      ]],
      difficulty: [ '', [
        Validators.required,
      ]],
    })
  }

  create(): void {

    if(this.gameForm.value.name.match(this.onlySpaceRegExp)) {
      this.gameForm.get('name')?.setErrors({'notValid': true});
      return
    }

    const game: NewGame = {
      gameType: this.type,
      gameName: this.gameForm.value.name,
      difficulty: this.gameForm.value.difficulty
    }
    this.lobbyService.create(game).subscribe(
      res => {
        this.join(res.lobbyId, game);
        this.gameService.gameId = res.lobbyId;
      },
      err => { 
        console.log(err);
      }
    )
  }

  private join(id: string, game: NewGame): void {
    this.lobbyService.join(id, game).subscribe(
      res => {
        this.router.navigate(['/lobby']);
        this.socketService.emit('joinLobby', {lobbyId: id});
      },
      err => {
        console.log(err);
      }
    )
  }

}
