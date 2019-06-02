import React, { Component } from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div`
	display:flex;
`;

const Beat = styled.div`
	flex-grow:1;
	height:50px;
	margin: 5px;
	border: 3px solid #000000;
`;

const PassedBeat = styled(Beat)`
	background-color:grey;
	&:nth-of-type(1) {
		background-color:#ffbbbb;
	}
`;

const Red = styled(Beat)`
	background-color:black;
	&:nth-of-type(1) {
		background-color:red;
	}
`;

export default class Click extends Component {
	render() {
		return (
			<Wrapper>
				{
					Array.apply(0, {length: this.props.beats}).map((value, index) => {
						if(index + 1 === this.props.beat){
							return (<Red key={index}/>)
						}
						return index < this.props.beat ? (<PassedBeat key={index}/>) : (<Beat key={index}/>)
					})
				}
			</Wrapper>
		);
	}
}
