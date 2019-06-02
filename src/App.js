import React, { Component } from 'react';
import Websocket from 'react-websocket';
import Click from './components/Click';
import Song from './components/Song';
import Fullscreen from "react-full-screen";
import styled from '@emotion/styled';

const Wrapper = styled.div`
	background-color:#ffffff;
`;

class App extends Component {
  constructor(){
    super();
    this.beat = 0;
    this.state = {
      clients: [],
      connections:{},
      clap: '',
      bar: '',
      midiConnectionId: null,
      isFullScreen: false,
    };
  }
  handleData(data) {
    const state = Object.assign({}, this.state);
    if(data.length === 1){
      this.beat = Math.floor(parseInt(data.charCodeAt(0) -1) / 4) + 1;
      state.beat = this.beat;
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
  toggleFullScreen(){
    console.log('toggle full screen');
    const state = Object.assign({}, this.state);
    state.isFullScreen = !state.isFullScreen;
    this.setState(state);
  }
  render(){
    return (
      <Fullscreen
        enabled={this.state.isFullScreen}
        onChange={isFullScreen => this.setState({isFullScreen})}
      >
        <Wrapper>
          <h1 onClick={() => this.toggleFullScreen()}>I Like To Suffer : {`${this.state.bar}.${this.beat}`}</h1>
          <Click beats={4} beat={this.state.beat}/>
          <Song id="I Like To Suffer" bar={this.state.bar/* % 229*/}/>
          <div><h1></h1></div>
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
            <div>Client List</div>
            {this.state.clients.map((client, id) => (<div key={id}>{client}</div>))}
          </div>

          <Websocket url={`ws://${window.location.hostname}:5050/`}
            onMessage={this.handleData.bind(this)}
            ref={socket => { this.webSocket = socket; }}/>
        </Wrapper>
      </Fullscreen>
    );
  }
}

export default App;
