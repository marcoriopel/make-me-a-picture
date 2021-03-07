import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Lobby } from './lobby';

@injectable()
export class CoopLobby extends Lobby {
    private team1: Map<string, Player> = new Map<string, Player>();
    private vPlayer: VirtualPlayer;
    
    constructor(difficulty: number, gameName: string, id: string) {
        super(difficulty, gameName, id);
        this.gameType = GameType.COOP;
        this.vPlayer = new VirtualPlayer();
        console.log("Created coop game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(user: BasicUser, socketId: string): void{
        if(this.team1.has(user.username)){
            throw new Error("You have already joined this lobby");
        }
        if(this.team1.size >= 4){
            throw new Error("Lobby is full");
        }
        
        const player: Player = {
            "username": user.username,
            "avatar": user.avatar,
            "isVirtual": false,
            "socketId": socketId,
        }

        this.team1.set(user.username, player);
    }    

    getPlayers(): any{
        let players = [];
        this.team1.forEach((player: Player) =>{
            players.push({"username": player.username, "avatar": player.avatar, "team": 0});
        })
        return players;
    } 

    removePlayer(): void{}
}