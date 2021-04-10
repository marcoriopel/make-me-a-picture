import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import { ChatManagerService } from '@app/services/managers/chat-manager.service';
import { StatusCodes } from 'http-status-codes';


@injectable()
export class ChatController {
    router: Router;

    constructor(
        @inject(TYPES.ChatManagerService) private chatManagerService: ChatManagerService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
    ) {
        this.configureRouter();
        this.tokenService = TokenService.getInstance();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/all/history', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, (user: any) => {
                this.chatManagerService.getAllUserChatsHistory(user.username, res, (chatsHistory: any) => {
                    res.status(StatusCodes.OK).send({ chatsHistory });
                });
            });
        });

        this.router.get('/history', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, () => {
                this.chatManagerService.getChatHistory(req.query.chatId, res, (chatHistory: any) => {
                    res.status(StatusCodes.OK).send({ chatHistory });
                });
            });
        });

        this.router.get('/joined', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, (user: any) => {
                this.chatManagerService.getAllUserChats(user.username, res, (chats: any) => {
                    res.status(StatusCodes.OK).send({ chats });
                });
            });
        });

        this.router.get('/list', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, () => {
                this.chatManagerService.getAllChats(res, (chats: any) => {
                    res.status(StatusCodes.OK).send({ chats });
                });
            });
        });

        this.router.post('/create', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, () => {
                this.chatManagerService.createChat(req.body.chatName, res, (chatId: any) => {
                    res.status(StatusCodes.OK).send({ chatId });
                });
            });
        });

        this.router.delete('/delete', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, () => {
                this.chatManagerService.deleteChatRequest(req.query.chatId, res, () => {
                    res.sendStatus(StatusCodes.OK);
                });
            });
        });
    }
}


