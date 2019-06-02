import React, { Component } from 'react';
import styled from '@emotion/styled';
import setup from '../userSetup.json';

const Wrapper = styled.div`
	display:flex;
	vertical-align:middle;
`;

const Part = styled.div`
	font-size: 32px;
	flex-grow:1;
	margin: 5px 0px 5px 0px;
	border: 3px solid #ffffff;
	text-align: center;
`;
const Remark = styled.div`
	font-size: 32px;
	flex-grow:1;
	margin: 5px;
	text-align: center;
`;
const CurrentPart = styled(Part)`
	border: 3px solid #000000;
	font-weight:600;
`;

export default class Song extends Component {
	constructor(props){
		super(props);
	}
	render() {
		if(!this.props.id){
			return (<div>No song selected!</div>);
		}
		const { arrangement, remarks } = setup.songs[this.props.id];
		const offsets = arrangement.reduce((accu, part) => {
			if(this.props.bar >= part.offset && accu.current < part.offset){
				accu.current = part.offset;
			}
			if(this.props.bar < part.offset && accu.next > part.offset){
				accu.next = part.offset
			}
			return accu;
		}, {current:0, next:99999});
		const rem = remarks.reduce((accu, remark) => {
			if(
				(!accu.length) 
				|| (this.props.bar >= remark.offset && accu[0].offset < remark.offset)
			){
				return [remark];
			} else if(accu.length){
				accu.push(remark);
			}
			return accu;
		}, []);
		return (
			<>
				<Wrapper>
					{
						arrangement.map((part, index) => {
							if(!part.name){
								return null;
							}
							if(offsets.current === part.offset){
								return (<CurrentPart key={`${index}-${part.name}`} style={part.style}>{part.name}: [{offsets.current}...{this.props.bar}...{offsets.next}]</CurrentPart>)
							}
							return (<Part key={`${index}-${part.name}`} style={part.style}>{part.name}</Part>)
						})
					}
				</Wrapper>
				<Wrapper>
					{
						rem.map((remark, index) => {
							if(!remark.text){
								return null;
							}
							if(this.props.bar >= remark.offset){
								return (<CurrentPart key={`remark-${index}`} style={remark.style}>{remark.text}</CurrentPart>);
							}
							return (<Part key={`remark-${index}`} style={remark.style}>{remark.text}</Part>);
						})
					}
				</Wrapper>
			</>
		);
	}
}