// Global variables are stored here
export const MINIMUM_CANVAS_WIDTH = 250;
export const MINIMUM_CANVAS_HEIGHT = 250;
export const MINIMUM_WORKSPACE_WIDTH = 500;
export const MINIMUM_WORKSPACE_HEIGHT = 500;
export const ZOOM_RADIUS = 75;
export const HALF_RATIO = 0.5;
export const TOOLTIP_DELAY = 500;
export const MAXIMUM_DISTANCE_LINE_CONNECTION = 20;
export const DEGREES_180 = 180;
export const MAXIMUM_NUMBER_OF_COLORS = 10;
export const MAX_OPACITY = 100;
export const ONE_NEGATIVE_PIXEL = -1;
export const MAX_TOOL_WIDTH = 50;
export const MIN_TOOL_WIDTH = 1;
export const MIN_ERASER_TOOL_WIDTH = 5;
export const MAX_BORDER = 20;
export const MIN_BORDER = 1;
export const DASH_LENGTH = 5;
export const DASH_SPACE_LENGTH = 3;
export const GROWTH_ZOOM_PIPETTE = 16;
export const MIN_TOLERANCE_VALUE = 0;
export const MAX_TOLERANCE_VALUE = 100;
export const MAX_PERCENTAGE = 100;
export const RGBA_STRING_ = 100;
export const CONFIRM_SAVED_DURATION = 5000;
export const CONFIRM_KEY_PRESS_DURATION = 500;
export const KEY_PRESS_INTERVAL_DURATION = 100;
export const SELECTION_MOVE_STEP_SIZE = 3;
export const LINE_WIDTH_POLYGONE_CORRECTION = 1.4;
export const MIN_GRID_SQUARE_SIZE = 5;
export const MAX_GRID_SQUARE_SIZE = 200;
export const MIN_GRID_OPACITY = 10;
export const MAX_GRID_OPACITY = 100;
export const DEFAULT_GRID_SIZE = 5;
export const GRID_STEP = 5;
export const MAGIC_WAND_BORDER_ONE_SIDE = 2;
export const MAGIC_WAND_BORDER_BOTH_SIDES = 4;
export const OFFSET = -1;

export const DEFAULT_GRID_OPACITY = 100;
export const TWO_DECIMAL_MULTIPLIER = 100;

// constant for text service
export const MARGIN = 5;
export const SIZE_STEP = 5;
export const MIN_TEXT_TOOL_SIZE = 15;
export const MAX_TEXT_TOOL_SIZE = 100;
export const MOVE_DOWN = -1;

// constant for rotation service
export const ANGLE_HALF_TURN = 180;
export const MAX_ANGLE = 360;
export const ROTATION_STEP_ALT = 1;

// constants for circle selection and square selection
export const MAGNETISM_NAME = 'Magnétisme';

// constants for spray service
export const SPRAY_DENSITY = 40;
export const MIN_SPRAY_WIDTH = 5;
export const MIN_SPRAY_DOT_WIDTH = 1;
export const MAX_SPRAY_DOT_WIDTH = 20;
export const MIN_SPRAY_FREQUENCY = 10;
export const MAX_SPRAY_FREQUENCY = 50;
export const ONE_SECOND = 1000;

// constants for pen service
export const ROTATION_STEP = 15;

export const MAX_NUMBER_VISIBLE_DRAWINGS = 3;
export const MIN_SIDES = 3;
export const MAX_SIDES = 12;
export const MAX_TAG_LENGTH = 15;
export const MAX_NAME_LENGTH = 15;
export const SELECTION_POINT_WIDTH = 6;
export const MAX_NUMBER_TAG = 5;
export const MAX_OPACITY_RGBA = 255;

export enum Quadrant {
    TOP_RIGHT = 0,
    TOP_LEFT = 1,
    BOTTOM_LEFT = 2,
    BOTTOM_RIGHT = 3,
}

export enum LineAngle {
    DEGREES_0 = 0,
    DEGREES_45 = 1,
    DEGREES_90 = 2,
    DEGREES_135 = 3,
    DEGREES_180 = 4,
    DEGREES_225 = 5,
    DEGREES_270 = 6,
    DEGREES_315 = 7,
}

export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    BACK = 3,
    FORWARD = 4,
}
