export const TYPES = {
    Server: Symbol('Server'),
    Application: Symbol('Application'),

    AuthController: Symbol('AuthController'),
    GamesController: Symbol('GamesController'),
    ChatController: Symbol('ChatController'),
    DrawingsController: Symbol('DrawingsController'),

    TokenService: Symbol('TokenService'),
    SocketService: Symbol('SocketService'),
    AuthService: Symbol('AuthService'),
    ChatManagerService: Symbol('ChatManagerService'),
    LobbyManagerService: Symbol('LobbyManagerService'),
    GameManagerService: Symbol('GameManagerService'),
    DrawingsService: Symbol('DrawingsService'),

    DatabaseModel: Symbol('DatabaseModel'),
    ChatModel: Symbol('ChatModel'),
    DrawingsModel: Symbol('DrawingsModel'),
    UserCredentialsModel: Symbol('UserCredentialsModel'),
    UserLogsModel: Symbol('UserLogsModel'),
};
