export const TYPES = {
    Server: Symbol('Server'),
    Application: Symbol('Application'),

    AuthController: Symbol('AuthController'),
    GamesController: Symbol('GamesController'),
    DrawingsController: Symbol('DrawingsController'),

    TokenService: Symbol('TokenService'),
    SocketService: Symbol('SocketService'),
    AuthService: Symbol('AuthService'),
    ChatManagerService: Symbol('ChatManagerService'),
    LobbyManagerService: Symbol('LobbyManagerService'),
    GameManagerService: Symbol('GameManagerService'),
    DrawingsService: Symbol('DrawingsService'),

    DatabaseModel: Symbol('DatabaseModel'),
    DrawingsModel: Symbol('DrawingsModel'),
    UserCredentialsModel: Symbol('UserCredentialsModel'),
    UserLogsModel: Symbol('UserLogsModel'),
};
