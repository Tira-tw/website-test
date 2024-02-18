import {INPUT_EVENT_TYPE, COLOR, Chessboard, BORDER_TYPE} from "cm-chessboard";
import {Accessibility} from "../../../vendor/cm-chessboard/src/extensions/accessibility/Accessibility.js";
import {MARKER_TYPE, Markers} from "../../../vendor/cm-chessboard/src/extensions/markers/Markers.js";
import {FEN} from "../../../vendor/cm-chessboard/src/model/Position.js";
import {PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog} from "../../../vendor/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";
import Ws from './Ws.js';

const inputHandler = (event) => {
  if (event.type === INPUT_EVENT_TYPE.movingOverSquare) {
    return;
  }

  if (event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
    event.chessboard.removeMarkers(MARKER_TYPE.dot);
    event.chessboard.removeMarkers(MARKER_TYPE.bevel);
  }

  if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
    ws.send(`/legal ${event.square}`);
    return true;
  } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
    ws.send(`/play_lan ${event.piece.charAt(0)} ${event.squareFrom}${event.squareTo}`);
    return false;
  }
}

const board = new Chessboard(document.getElementById("board"), {
  position: FEN.start,
  assetsUrl: "https://cdn.jsdelivr.net/npm/cm-chessboard@8.5.0/assets/",
  style: {borderType: BORDER_TYPE.none, pieces: {file: "pieces/staunty.svg"}, animationDuration: 300},
  orientation: COLOR.white,
  extensions: [
    {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
    {class: PromotionDialog},
    {class: Accessibility, props: {visuallyHidden: true}}
  ]
});

board.enableMoveInput(inputHandler);

const ws = new Ws(board);
await ws.connect();
await ws.send('/start classical fen');