export const TYPES = {
    Server: Symbol('Server'),
    Application: Symbol('Application'),

    AuthController: Symbol('AuthController'),
    GamesController: Symbol('GamesController'),
    ChatController: Symbol('ChatController'),

    TokenService: Symbol('TokenService'),
    SocketService: Symbol('SocketService'),
    AuthService: Symbol('AuthService'),
    ChatManagerService: Symbol('ChatManagerService'),
    LobbyManagerService: Symbol('LobbyManagerService'),
    GameManagerService: Symbol('GameManagerService'),

    DatabaseModel: Symbol('DatabaseModel'),
    ChatModel: Symbol('ChatModel'),
    UserCredentialsModel: Symbol('UserCredentialsModel'),
    UserLogsModel: Symbol('UserLogsModel'),
};
