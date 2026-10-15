// Transcribed from Transformer Project.pdf, pp. 2–3. Excerpts, not new generations.
export const storySamples = [
  {
    prompt: 'Once upon a time',
    text: ', blew tw en see ished Timmy taste confused led gre ins Don That law iness ess bet spe ds wi.',
    finding:
      'Story vocabulary appears, but subword fragments interrupt the sentence.',
  },
  {
    prompt: 'The little dog',
    text: ', urn continued faster spill really hugged jumped har k Lily soap rainbow boys Bird Now serious c children cars plane bad walked Jimmy S ipp fla',
    finding:
      'Names and familiar objects appear without a stable grammatical structure.',
  },
  {
    prompt: 'One day',
    text: ', a girl named smart terrible park trouble al ummy yal yal yal yal yal yal yal',
    finding: 'A recognizable opening quickly collapses into a repeated token.',
  },
  {
    prompt: 'The little cat',
    text: 'squash to deer some ain funny do talked - lly frightened Mia batter tough covered like Mum hugs rare look pract sunflower drink lie jo frustr',
    finding:
      'Words match the topic of children’s stories, but no narrative develops.',
  },
  {
    prompt: 'Tim found a red box',
    text: 'pack idea A frightened Jerry ." arrived door most gif whole on an can celebr bite forest meet ing ore It edy corner Max fear ther rod ug',
    finding:
      'The continuation loses the red-box premise instead of building on it.',
  },
];
