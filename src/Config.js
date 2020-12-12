export const AUDIO_FRAME = 10;
export const FPS = 60;

export const defaultStyle = {
  transition: `opacity ${300}ms ease-in-out`,
  opacity: 0,
};

export const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};