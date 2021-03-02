import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameType, NewGame } from '@app/classes/game';
import { LobbyService } from '@app/services/lobby/lobby.service';
import { errorMessages } from '../register/custom-validator';

@Component({
  selector: 'app-game-creation',
  templateUrl: './game-creation.component.html',
  styleUrls: ['./game-creation.component.scss']
})
export class GameCreationComponent implements OnInit {

  @Input() type: GameType;

  gameForm: FormGroup;
  errors = errorMessages;

  constructor(private fb: FormBuilder, private lobbyService: LobbyService, private router: Router) { }

  ngOnInit(): void {
    this.gameForm = this.fb.group({
      name: [ '', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(128)
      ]],
      difficulty: [ '', [
        Validators.required,
      ]],
    })
  }

  create(): void {
    const game: NewGame = {
      gameType: this.type,
      gameName: this.gameForm.value.name,
      difficulty: this.gameForm.value.difficulty
    }
    this.lobbyService.create(game).subscribe(
      res => {
        // TODO : Redirect to lobby
        console.log(res.lobbyId);
        this.join(res.lobbyId);
      },
      err => {
        console.log(err);
      }
    )
  }

  private join(id: string): void {
    this.lobbyService.join(id).subscribe(
      res => {
        this.router.navigate(['/lobby']);
      },
      err => {
        console.log(err);
      }
    )
  }

}
