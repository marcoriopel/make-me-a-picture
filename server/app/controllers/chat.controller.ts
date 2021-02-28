import { TokenService } from '@app/services/token.service';
import { TYPES } from '@app/types';
import { Router, Response, Request } from 'express';
import { inject, injectable } from 'inversify';
import { ChatManagerService } from '@app/services/chat-manager.service';
import {
    StatusCodes,
} from 'http-status-codes';


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

        this.router.get('/history', (req: Request, res: Response) => {
            this.tokenService.authenticateToken(req, res, (username: any) => {
                this.chatManagerService.getAllChatHistory(username, res, (chatsHistory: any) => {
                    res.status(StatusCodes.OK).send({ chatsHistory });
                });
            });
        });

    }
}


