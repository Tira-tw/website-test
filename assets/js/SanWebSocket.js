import { INPUT_EVENT_TYPE, MARKER_TYPE } from '@chesslablab/cmblab';
import { Movetext } from '@chesslablab/jsblab';
import chessboard from './pages/chessboard.js';
import { infoModal } from './pages/InfoModal.js';
import { sanPanel } from './pages/SanPanel.js';
import { progressModal } from './pages/ProgressModal.js';
import * as env from '../env.js';
import * as mode from '../mode.js';
import * as variant from '../variant.js';

export class SanWebSocket {
  constructor() {
    chessboard.enableMoveInput((event) => {
      if (event.type === INPUT_EVENT_TYPE.movingOverSquare) {
        return;
      }

      if (event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
        event.chessboard.removeMarkers(MARKER_TYPE.dot);
        event.chessboard.removeMarkers(MARKER_TYPE.bevel);
      }

      if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        this.send(`/legal ${event.square}`);
        return true;
      } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        this.send(`/play_lan ${event.piece.charAt(0)} ${event.squareFrom}${event.squareTo}`);
        return true;
      }
    });

    sanPanel.props.gameStudyDropdown.props.ul.children.item(3).addEventListener('click', async (event) => {
      event.preventDefault();
      this.send(`/tutor_fen "${sanPanel.props.sanMovesBrowser.props.fen[sanPanel.props.sanMovesBrowser.current]}" ${variant.CLASSICAL}`);
    });

    sanPanel.props.gameActionsDropdown.props.ul.children.item(0).addEventListener('click', (event) => {
      event.preventDefault();
      this.send('/undo');
    });

    this.socket = null;
  }

  connect() {
    progressModal.props.modal.show();

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${env.WEBSOCKET_SCHEME}://${env.WEBSOCKET_HOST}:${env.WEBSOCKET_PORT}`);

      this.socket.onopen = () => {
        progressModal.props.modal.hide();
        resolve();
      };

      this.socket.onmessage = (res) => {
        const data = JSON.parse(res.data);
        const msg = Object.keys(data)[0];
        switch (true) {
          case 'error' === msg:
            console.log('Whoops! Something went wrong.');
            break;

          case '/start' === msg:
            if (data['/start'].movetext) {
              chessboard.setPosition(data['/start'].fen[data['/start'].fen.length - 1], true);
              chessboard.props.variant = data['/start'].variant;
              chessboard.props.startPos = data['/start'].startPos;
              sanPanel.props.sanMovesBrowser.current = data['/start'].fen.length - 1;
              sanPanel.props.sanMovesBrowser.props.movetext = Movetext.notation(localStorage.getItem('notation'), data['/start'].movetext);
              sanPanel.props.sanMovesBrowser.props.fen = data['/start'].fen;
              sanPanel.props.sanMovesBrowser.mount();
              sanPanel.props.openingTable.props.movetext = data['/start'].movetext;
              sanPanel.props.openingTable.mount();
            } else {
              infoModal.props.msg = "Invalid SAN movetext, please try again";
              infoModal.mount();
              infoModal.props.modal.show();
            }
            break;

          case '/legal' === msg:
            data['/legal'].forEach(sq => {
              chessboard.addMarker(MARKER_TYPE.dot, sq);
            });
            break;

          case '/play_lan' === msg:
            if (data['/play_lan'].isValid) {
              chessboard.setPosition(data['/play_lan'].fen, true);
              sanPanel.props.sanMovesBrowser.current = sanPanel.props.sanMovesBrowser.props.fen.length;
              sanPanel.props.sanMovesBrowser.props.movetext = Movetext.notation(localStorage.getItem('notation'), data['/play_lan'].movetext);
              sanPanel.props.sanMovesBrowser.props.fen = sanPanel.props.sanMovesBrowser.props.fen.concat(data['/play_lan'].fen);
              sanPanel.props.sanMovesBrowser.mount();
              sanPanel.props.openingTable.props.movetext = data['/play_lan'].movetext;
              sanPanel.props.openingTable.mount();
            } else {
              chessboard.setPosition(data['/play_lan'].fen, false);
            }
            break;

          case '/undo' === msg:
            chessboard.setPosition(data['/undo'].fen, true);
            if (!data['/undo'].movetext) {
              chessboard.state.inputWhiteEnabled = true;
              chessboard.state.inputBlackEnabled = false;
            }
            sanPanel.props.sanMovesBrowser.current -= 1;
            sanPanel.props.sanMovesBrowser.props.fen.splice(-1);
            sanPanel.props.sanMovesBrowser.props.movetext = Movetext.notation(localStorage.getItem('notation'), data['/undo'].movetext);
            sanPanel.props.sanMovesBrowser.mount();
            sanPanel.props.openingTable.props.movetext = data['/undo'].movetext;
            sanPanel.props.openingTable.mount();
            break;

          case '/tutor_fen' === msg:
            sanPanel.props.explainPositionModal.props.explanation = data['/tutor_fen'];
            sanPanel.props.explainPositionModal.mount();
            sanPanel.props.explainPositionModal.props.modal.show();
            break;

          default:
            break;
        }
      };

      this.socket.onclose = (err) => {
        console.log('The connection has been lost, please reload the page.');
        reject(err);
      };

      this.socket.onerror = (err) => {
        console.log('The connection has been lost, please reload the page.');
        reject(err);
      };
    });
  }

  send(msg) {
    if (this.socket) {
      this.socket.send(msg);
    }
  }
}

export const sanWebSocket = new SanWebSocket();
