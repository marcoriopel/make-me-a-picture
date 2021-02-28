import { AuthController } from '@app/controllers/auth.controller';
import { GamesController } from '@app/controllers/games.controller';
import { DrawingsController } from '@app/controllers/drawings.controller';
import { DatabaseModel } from '@app/models/database.model';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { UserCredentialsModel } from './models/user-credentials.model';
import { UserLogsModel } from './models/user-logs.model';
import { DrawingsModel } from './models/drawings.model';
import { TYPES } from './types';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { SocketService } from './services/socket.service';
import { ChatManagerService } from './services/chat-manager.service';
import { LobbyManagerService } from './services/lobby-manager.service';
import { GameManagerService } from './services/game-manager.service';
import { DrawingsService } from './services/drawings.service';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.AuthController).to(AuthController);
    container.bind(TYPES.GamesController).to(GamesController);
    container.bind(TYPES.DrawingsController).to(DrawingsController);

    container.bind(TYPES.TokenService).to(TokenService);
    container.bind(TYPES.SocketService).to(SocketService);
    container.bind(TYPES.AuthService).to(AuthService);
    container.bind(TYPES.ChatManagerService).to(ChatManagerService);
    container.bind(TYPES.LobbyManagerService).to(LobbyManagerService);
    container.bind(TYPES.GameManagerService).to(GameManagerService);
    container.bind(TYPES.DrawingsService).to(DrawingsService);

    container.bind(TYPES.DatabaseModel).to(DatabaseModel);
    container.bind(TYPES.DrawingsModel).to(DrawingsModel);
    container.bind(TYPES.UserCredentialsModel).to(UserCredentialsModel);
    container.bind(TYPES.UserLogsModel).to(UserLogsModel);
    return container;
};
const myContainer = new Container();

export { myContainer };
