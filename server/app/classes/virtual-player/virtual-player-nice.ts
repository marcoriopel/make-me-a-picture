import { GameType } from '@app/ressources/variables/game-variables';
import { Personnality } from '@app/ressources/variables/virtual-player-variables';
import { vPlayerText } from '@app/ressources/variables/vplayer-messages';
import { injectable } from 'inversify';
import { VirtualPlayer } from './virtual-player';

@injectable()
export class VirtualPlayerNice extends VirtualPlayer {

    constructor(gameId: string, gameType: number) {
        super(gameId, gameType);
        this.personnality = Personnality.NICE;
        this.username = "Bernard";
        this.avatar = 6;
    }

    sayHello() {
        if (this.lastMutualGames[0]) {
            this.sayHelloAgain();
        }
        else {
            let str = vPlayerText.nice.meet.split("##");
            let message = str[0] + this.teammates + str[1];
            const timestamp = new Date();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);

        }
    }

    private sayHelloAgain() {
        const lastMutualGame = this.lastMutualGames[0];
        switch (lastMutualGame.gameType) {
            case GameType.SOLO:
                this.sayHelloAgainSolo();
                break;
            case GameType.COOP:
                this.sayHelloAgainCoop();
                break;
            case GameType.CLASSIC:
                this.sayHelloAgainClassic();
                break;
        }
    }

    private sayHelloAgainSolo() {
        const lastMutualGame = this.lastMutualGames[0];
        let str = vPlayerText.nice.meetAgainSolo.split("##");
        let message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    private sayHelloAgainCoop() {
        const lastMutualGame = this.lastMutualGames[0];
        let str = vPlayerText.nice.meetAgainCoop.split("##");
        let friends = [];
        for (let player of lastMutualGame.players) {
            if (player.username != this.username && player.username != this.teammates[0]) {
                friends.push(player.username);
            }
        }
        let friendsStr = this.arrayToString(friends);
        let message = str[0] + this.teammates + str[1] + friendsStr + str[2];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    private sayHelloAgainClassic() {
        const lastMutualGame = this.lastMutualGames[0];
        let teammateTeam;
        let vPlayerTeam;
        for (let player of lastMutualGame.players) {
            if (player.username == this.username) {
                vPlayerTeam = player.team;
            }
            if (player.username == this.teammates[0]) {
                teammateTeam = player.team;
            }
        }

        if (teammateTeam == vPlayerTeam) {
            this.sayHelloAgainClassicSameTeam(vPlayerTeam);
        }
        else {
            this.sayHelloAgainClassicOpposingTeam(vPlayerTeam);
        }
    }

    private sayHelloAgainClassicSameTeam(teamNumber: number) {
        const lastMutualGame = this.lastMutualGames[0];
        let opposingTeamNumber = this.getOpposingTeamNumber(teamNumber);
        let message;
        let opposingTeamNames = [];
        for (let player of lastMutualGame.players) {
            if (player.team == opposingTeamNumber) {
                opposingTeamNames.push(player.username);
            }
        }
        if (lastMutualGame.score[teamNumber] > lastMutualGame.score[opposingTeamNumber]) {
            let str = vPlayerText.nice.meetAgainClassicWin.split("##");
            message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2] + lastMutualGame.score[teamNumber] + str[3] + lastMutualGame[opposingTeamNumber] + str[4];
        }
        else if (lastMutualGame.score[teamNumber] < lastMutualGame.score[opposingTeamNumber]) {
            let str = vPlayerText.nice.meetAgainClassicLose.split("##");
            message = str[0] + this.teammates + str[1];
        }
        else {
            let str = vPlayerText.nice.meetAgainClassicTie.split("##");
            message = str[0] + this.teammates + str[1] + this.getDate(lastMutualGame.start) + str[2];
        }
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    private sayHelloAgainClassicOpposingTeam(teamNumber: number) {
        let str = vPlayerText.anxious.meetAgainClassicOpposingTeam.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayHelloMany() {
        for (let lastMutualGame of this.lastMutualGames) {
            if (lastMutualGame) {
                this.sayHelloAgainMany();
                return;
            }
        }
        let str = vPlayerText.nice.meetMany.split("##");
        let teamStr = this.arrayToString(this.teammates);
        let message = str[0] + teamStr + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayHelloAgainMany() {
        let newPlayers: string[] = [];
        let oldPlayers: string[] = [];
        for (let i = 0; i < this.teammates.length; ++i) {
            if (this.lastMutualGames[i]) {
                oldPlayers.push(this.teammates[i]);
            }
            else {
                newPlayers.push(this.teammates[i]);
            }
        }

        const timestamp = new Date();
        if (newPlayers.length == 0) {
            let str = vPlayerText.nice.meetAgainAll.split("##");
            let message = str[0] + this.teammates[1] + str[1] + this.teammatesStats[1].bestCoopScore + str[2];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
        else {
            let str = vPlayerText.nice.meetAgainMany.split("##");
            let message = str[0] + this.arrayToString(newPlayers) + str[1] + this.teammatesStats[0].bestCoopScore + str[2] + this.teammates[0] + str[3];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
    }

    sayRightGuess() {
        let str = vPlayerText.nice.rightGuess.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayWrongGuess() {
        let message = vPlayerText.nice.wrongGuess;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayWrongTry() {
        let message = vPlayerText.nice.wrongTry;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayWeWon() {
        let str = vPlayerText.nice.weWon.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayWeLost() {
        let message = vPlayerText.nice.weLost;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayWeTied() {
        let str = vPlayerText.nice.weTied.split("##");
        let message = str[0] + this.teammates + str[1];
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayEndSprintGame() {
        let message = vPlayerText.nice.endSprintGame;
        const timestamp = new Date();
        this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
        const incomingMessage = {
            token: "0",
            text: message,
            chatId: this.gameId
        }
        this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
    }

    sayEndSoloGame(finalScore: number) {
        const teammateStats = this.teammatesStats[0];

        if (finalScore <= teammateStats.bestSoloScore) {
            let str = vPlayerText.nice.endSoloGameBestScore.split("##");
            let message = str[0] + (teammateStats.bestSoloScore - finalScore) + str[1];
            const timestamp = new Date();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
        else {
            let str = vPlayerText.nice.endSoloGameBestScore.split("##");
            let message = str[0] + this.teammates + str[1] + (finalScore - teammateStats.bestSoloScore) + str[2];
            const timestamp = new Date();
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
    }

    sayEndCoopGame(finalScore: number) {
        let newHighScorePlayers: string[] = [];
        let oldHighScorePlayers: string[] = [];
        let worstCoopScoreIndex = 0;
        let bestCoopScoreIndex = 0;
        for (let i = 0; i < this.teammates.length; ++i) {
            if (finalScore <= this.teammatesStats[i].bestCoopScore) {
                oldHighScorePlayers.push(this.teammates[i]);
            }
            else {
                newHighScorePlayers.push(this.teammates[i]);
            }
            if (this.teammatesStats[i].bestCoopScore <= this.teammatesStats[worstCoopScoreIndex].bestCoopScore) {
                worstCoopScoreIndex = i;
            }
            if (this.teammatesStats[i].bestCoopScore >= this.teammatesStats[bestCoopScoreIndex].bestCoopScore) {
                bestCoopScoreIndex = i;
            }
        }

        const timestamp = new Date();
        if (newHighScorePlayers.length == 0) {
            let str = vPlayerText.nice.endCoopGame.split("##");
            let message = str[0] + this.teammates + str[1] + this.teammatesStats[worstCoopScoreIndex].bestCoopScore + str[2] + this.teammates[worstCoopScoreIndex] + str[3];
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
        else if (oldHighScorePlayers.length == 0) {
            let message = vPlayerText.nice.endCoopGameBestScoreAll;
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
        else {
            let str = vPlayerText.nice.endCoopGameBestScoreSome.split("##");
            let message;
            if (newHighScorePlayers.length > 1) {
                message = str[0] + this.arrayToString(newHighScorePlayers) + str[1] + "vous êtes contents" + str[2] + "votre" + str[3];
            }
            else {
                message = str[0] + this.arrayToString(newHighScorePlayers) + str[1] + "tu es content" + str[2] + "ton" + str[3];
            }
            this.socketService.getSocket().to(this.gameId).emit('message', { "user": this.getBasicUser(), "text": message, "timestamp": timestamp.getTime(), "textColor": "#000000", chatId: this.gameId });
            const incomingMessage = {
                token: "0",
                text: message,
                chatId: this.gameId
            }
            this.chatManagerService.addMessageToDB(this.getBasicUser(), incomingMessage, timestamp);
        }
    }
}