import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Lobby } from './lobby';

@injectable()
export class ClassicLobby extends Lobby {
    private teams: Map<string, Player>[] = [new Map<string, Player>(), new Map<string, Player>()];
    private vPlayers: VirtualPlayer[] = new Array(2);

    constructor(difficulty: number, gameName: string, id: string, isPrivate: boolean) {
        super(difficulty, gameName, id, isPrivate);
        this.gameType = GameType.CLASSIC;
        console.log("Created classic game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void { }

    deleteLobby(): void { }

    addPlayer(user: BasicUser, socketId: string): void {
        if (this.isUserInLobby(user)) {
            throw new Error("You have already joined this lobby");
        }
        if (this.isLobbyFull()) {
            throw new Error("Lobby is full");
        }

        const player: Player = {
            "username": user.username,
            "avatar": user.avatar,
            "isVirtual": false,
            "socketId": socketId,
        }

        if (this.teams[0].size <= this.teams[1].size) {
            this.teams[0].set(user.username, player);
        }
        else {
            this.teams[1].set(user.username, player);
        }
    }

    addVirtualPlayer(teamNumber: number): void {
        if (this.isLobbyFull()) {
            throw new Error("Lobby is full");
        }
        let vPlayerIsUnique: boolean = false;
        let tempVPlayer: VirtualPlayer;
        while (!vPlayerIsUnique) {
            tempVPlayer = this.generateRandomVPlayer();
            if (!this.isUserInLobby(tempVPlayer.getBasicUser())) {
                vPlayerIsUnique = true;
            }
        }
        if (this.teams[teamNumber].size < 2 && this.vPlayers[teamNumber] == undefined) {
            this.vPlayers[teamNumber] = tempVPlayer;
            const tempVPlayerBasicInfo: BasicUser = tempVPlayer.getBasicUser();
            const vPlayer: Player = {
                "username": tempVPlayerBasicInfo.username,
                "avatar": tempVPlayerBasicInfo.avatar,
                "isVirtual": true,
                "socketId": null,
            }
            this.teams[teamNumber].set(tempVPlayerBasicInfo.username, vPlayer)
        }
        else {
            throw new Error("No more virtual players can be added to this team");
        }
    }

    removeVirtualPlayer(teamNumber: number, username: string): void {
        if (this.teams[teamNumber].delete(username)) {
            this.vPlayers[teamNumber] = undefined;
        }
        else {
            throw new Error("Virtual player not found");
        }
    }

    getPlayers(): any {
        let players = [];
        for (let i = 0; i < this.teams.length; ++i) {
            this.teams[i].forEach((player: Player) => {
                players.push({ "username": player.username, "avatar": player.avatar, "team": i, "isVirtual": player.isVirtual });
            })
        }
        return players;
    }

    removePlayer(user: BasicUser): void {
        for (let team of this.teams) {
            if (team.has(user.username)) {
                team.delete(user.username);
                return
            }
        }
        throw new Error("You are not part of this lobby")
    }

    private isUserInLobby(user: BasicUser): boolean {
        return this.teams[0].has(user.username) || this.teams[1].has(user.username);
    }

    private isLobbyFull(): boolean {
        return this.teams[0].size == 2 && this.teams[1].size == 2;
    }

    getTeams(): Map<string, Player>[] {
        return this.teams;
    }

    getVPlayers(): VirtualPlayer[] {
        return this.vPlayers;
    }
}