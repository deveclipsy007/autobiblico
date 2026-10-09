import React from 'react';
import {Composition} from 'remotion';
import {Film, FilmProps} from './films/vpc-001/Film';
import {END} from './films/vpc-001/story';
import {CharacterSheet} from './brand/characters/CharacterSheet';

export const FPS = 60;
const DUR = Math.round(END * FPS);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="VPC001-Vertical" component={Film} durationInFrames={DUR} fps={FPS} width={1080} height={1920} defaultProps={{audio: 'none'} as FilmProps} />
    <Composition id="VPC001-Horizontal" component={Film} durationInFrames={DUR} fps={FPS} width={1920} height={1080} defaultProps={{audio: 'none'} as FilmProps} />
    <Composition id="VPC-Personagens" component={CharacterSheet} durationInFrames={90} fps={30} width={1920} height={1080} />
  </>
);
