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
const Progress = styled.div`
	margin:0;
	padding:0;
	height:10px;
	align:left;
	vertical-align:top;
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
		const arr = arrangement.reduce((accu, part) => {
			if(
				(!accu.length) 
				|| (this.props.bar >= part.offset && accu[0].offset < part.offset)
			){
				return [part];
			} else if(accu.length){
				accu.push(part);
			}
			return accu;
		}, []);
		const offsets = arr.reduce((accu, part) => {
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
						arr.map((part, index) => {
							if(!part.name){
								return null;
							}
							if(offsets.current === part.offset){
								return (
									<CurrentPart key={`${index}-${part.name}`} style={part.style}>
										<div>
										{part.name}{false && (<>: [{offsets.current}...{this.props.bar}...{offsets.next}]</>)}
										</div>
										<Progress>
											<div style={{backgroundColor:'#000000', height: '100%', width:`${100 * (this.props.bar - offsets.current + 1)/(offsets.next - offsets.current)}%`, opacity:0.5}}></div>
										</Progress>
									</CurrentPart>
								)
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
