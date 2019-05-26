import React, { Component } from 'react';
import Websocket from 'react-websocket';

class App extends Component {
  constructor(){
    super();
    this.state = {
      clients: [],
      connections:{},
      clap: ''
    };
  }
  handleData(data) {
    const {type, payload} = JSON.parse(data);
    const state = Object.assign({}, this.state);
    switch (type) {
      case "CLIENT_LIST":
          state.clients = payload;
          this.setState(state);
        break;
      case "LIST_CONNECTIONS_RESPONSE":
          state.connections = payload;
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
          }))}>List Devices</button>
          {Object.entries(this.state.connections).map(entry => (<div key={entry[0]}>{entry[1]}<button onClick={() => this.sendMessage(JSON.stringify({
			type: "CONNECT",
			payload: entry[0]
		}))}>connect</button></div>))}
        </div>
        <div>
          <div><h1>{`${this.state.bar} ${this.state.clap}`}</h1></div>
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
