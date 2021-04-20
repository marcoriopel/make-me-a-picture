export interface Lobby {
    id: string;
    gameName: string;
    gameType: number;
    difficulty: number;
    isPrivate: boolean;
}

export function validateLobby(element: any): boolean {
    if (!element.id)
        return false;
    if (!element.gameName)
        return false;
    if (element.gameType && isNaN(element.gameType))
        return false;
    if (element.difficulty && isNaN(element.difficulty))
        return false;
    return true
}
