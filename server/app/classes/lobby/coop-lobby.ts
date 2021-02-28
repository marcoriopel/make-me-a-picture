import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class CoopLobby extends Lobby {
    team1: Map<string, number> = new Map<string, number>();
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
        this.gameType = GameType.COOP;
        console.log("Created coop game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(user: BasicUser): void{
        if(this.team1.has(user.username)){
            return;
        }
        if(this.team1.size < 4){
            this.team1.set(user.username, user.avatar);
        }
    }    

    getPlayers(): any{
        let players = [];
        for(let user in this.team1){
            players.push({"user": this.team1[user], "team": 1});
        }
        return players;
    } 

    removePlayer(): void{}
}