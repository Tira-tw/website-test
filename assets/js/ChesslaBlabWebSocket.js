import { COLOR } from "cm-chessboard";
import { MARKER_TYPE } from '../vendor/cm-chessboard/src/extensions/markers/Markers.js';
import * as modeConst from '../modeConst.js';

export default class ChesslaBlabWebSocket {
  constructor(
    chessboard,
    sanMovesTable,
    openingTable,
    startedButtons,
    gameActionsDropdown
  ) {
    this.chessboard = chessboard;
    this.sanMovesTable = sanMovesTable;
    this.openingTable = openingTable;
    this.startedButtons = startedButtons;
    this.gameActionsDropdown = gameActionsDropdown;
    this.startedButtons.addEventListener('click', () => {
      this.send('/undo');
    });

    this.socket = null;
  }

  connect() {
    console.log('Establishing connection...');

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket('wss://async.chesslablab.org:8443');

      this.socket.onopen = () => {
        console.log('Opened connection!');
        resolve();
      };

      this.socket.onmessage = (res) => {
        const data = JSON.parse(res.data);
        const msg = Object.keys(data)[0];
        switch (true) {
          case 'error' === msg:
            if (data['error']) {
              console.log('Whoops! Something went wrong.');
            }
            break;

          case '/start' === msg:
            if (data['/start'].mode === modeConst.FEN) {
              if (data['/start'].fen) {
                this.chessboard.setPosition(data['/start'].fen, true);
              } else {
                console.log('Invalid FEN, please try again with a different one.');
              }
            } else if (data['/start'].mode === modeConst.SAN) {
              if (data['/start'].movetext) {
                this.chessboard.setPosition(data['/start'].fen[data['/start'].fen.length - 1], true);
                this.sanMovesTable.current = data['/start'].fen.length - 1;
                this.sanMovesTable.settings = {
                  ...this.sanMovesTable.settings,
                  movetext: data['/start'].movetext,
                  fen: data['/start'].fen
                };
                this.sanMovesTable.domNode();
                this.openingTable.domNode();
              } else {
                console.log('Invalid SAN movetext, please try again with a different one.');
              }
            }
            break;

          case '/legal' === msg:
            if (data['/legal']) {
              Object.keys(data['/legal'].fen).forEach(key => {
                this.chessboard.addMarker(MARKER_TYPE.dot, key);
              });
            }
            break;

          case '/play_lan' === msg:
            if (data['/play_lan'].fen) {
              this.chessboard.setPosition(data['/play_lan'].fen, true);
              if (!this.sanMovesTable.settings.fen[this.sanMovesTable.settings.fen.length - 1].startsWith(data['/play_lan'].fen)) {
                let fen = this.sanMovesTable.settings.fen;
                fen.push(data['/play_lan'].fen);
                this.sanMovesTable.settings = {
                  ...this.sanMovesTable.settings,
                  movetext: data['/play_lan'].movetext,
                  fen: fen
                };
                this.sanMovesTable.current = this.sanMovesTable.settings.fen.length - 1;
                this.sanMovesTable.domNode();
                this.openingTable.domNode();
              }
            }
            break;

          case '/undo' === msg:
            if (data['/undo']) {
              this.chessboard.setPosition(data['/undo'].fen, true);
              let fen = this.sanMovesTable.settings.fen;
              fen.pop();
              this.sanMovesTable.settings = {
                ...this.sanMovesTable.settings,
                movetext: data['/undo'].movetext,
                fen: fen
              };
              this.sanMovesTable.domNode();
              this.openingTable.domNode();
            }
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

  msg() {
    if (this.socket) {
      const msg = JSON.parse(localStorage.getItem('msg'))
      if (msg) {
        if (msg.name === '/start') {
          this.socket.send(`${msg.name} ${msg.payload.variant} ${msg.payload.mode} "${JSON.stringify(msg.payload.add).replace(/"/g, '\\"')}"`);
        }
      } else {
        this.socket.send('/start classical fen');
      }
    }
  }
}