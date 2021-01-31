export interface SelectionPoints {
    TOP_Y: number;
    MIDDLE_Y: number;
    BOTTOM_Y: number;
    LEFT_X: number;
    MIDDLE_X: number;
    RIGHT_X: number;
}

export interface SelectionPointsNames {
    NO_POINTS: number;
    TOP_LEFT: number;
    MIDDLE_LEFT: number;
    BOTTOM_LEFT: number;
    TOP_MIDDLE: number;
    BOTTOM_MIDDLE: number;
    TOP_RIGHT: number;
    MIDDLE_RIGHT: number;
    BOTTOM_RIGHT: number;
}

export const SELECTION_POINTS_NAMES: SelectionPointsNames = {
    NO_POINTS: 0,
    TOP_LEFT: 1,
    MIDDLE_LEFT: 2,
    BOTTOM_LEFT: 3,
    TOP_MIDDLE: 4,
    BOTTOM_MIDDLE: 5,
    TOP_RIGHT: 6,
    MIDDLE_RIGHT: 7,
    BOTTOM_RIGHT: 8,
};
