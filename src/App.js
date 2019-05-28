import React, { Component } from 'react';
import Websocket from 'react-websocket';

class App extends Component {
  constructor(){
    super();
    this.fraction = 0;
    this.state = {
      clients: [],
      connections:{},
      clap: '',
      bar: '',
      midiConnectionId: undefined
    };
  }
  handleData(data) {
    const state = Object.assign({}, this.state);
    if(data.length === 1){
      this.fraction = Math.floor(parseInt(data.charCodeAt(0) -1) / 4) + 1;
      state.fraction = this.fraction;
      this.setState(state);
      return;
    }

    const {type, payload} = JSON.parse(data);
    switch (type) {
      case "CLIENT_LIST":
          state.clients = payload;
          this.setState(state);
        break;
      case "LIST_CONNECTIONS_RESPONSE":
          state.connections = payload;
          this.setState(state);
        break;
      case "MIDI_CONNECTED":
          state.midiConnectionId = payload.connectionId;
          this.setState(state);
        break;
      case "MIDI_DISCONNECTED":
          if(state.midiConnectionId !== payload.connectionId){
            return;
          }
          state.midiConnectionId = undefined;
          this.setState(state);
        break;
      case "MIDI":
          switch(payload.type){
            case "TIMING_CLOCK":
              state.clap = payload.payload.clap;
              state.bar = payload.payload.bar;
              this.setState(state);
              break;
            default:
                console.error('UNKNOWN MIDI COMMAND', payload);
          }
        break;
      default:
        console.error('UNKNOWN SOCKET DATA TYPE', data);
    }
  }
  sendMessage(message){
    this.webSocket.sendMessage(message);
  }
  render(){
    return (
      <div className="App">
        <div>
          <button onClick={() => this.sendMessage(JSON.stringify({
            type: "LIST_CONNECTIONS_REQUEST"
          }))}>List Connections</button>
          {Object.entries(this.state.connections).map(entry => (<div key={entry[0]}>{entry[1]}
            {this.state.midiConnectionId !== entry[0] && (<button onClick={() => this.sendMessage(JSON.stringify({
              type: "CONNECT",
              payload: entry[0]
            }))}>connect</button>)}
            {this.state.midiConnectionId === entry[0] && (<button onClick={() => this.sendMessage(JSON.stringify({
              type: "DISCONNECT",
              payload: entry[0]
            }))}>disconnect</button>)}
          </div>))}
        </div>
        <div>
          <div><h1>{`${this.state.bar} ${this.fraction}`}</h1></div>
          <div>Client List</div>
          {this.state.clients.map((client, id) => (<div key={id}>{client}</div>))}
        </div>

	<Websocket url={`ws://${window.location.hostname}:5050/`}
          onMessage={this.handleData.bind(this)}
          ref={socket => { this.webSocket = socket; }}/>
      </div>
    );
  }
}

export default App;
