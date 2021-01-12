export const AUDIO_FRAME = 10;
export const FPS = 60;

export const defaultStyle = {
  transition: `opacity ${500}ms ease-in-out`,
  opacity: 0,
};

export const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

export const defaultStyleMount = {
  transition: `opacity ${500}ms ease-in-out`,
  opacity: 0,
  background: `radial-gradient(circle closest-side,var(--secondary), var(--primary))`,
};


var colors = require('./App.css');

export const bgColor = colors.primary;

export const fontColor = colors.secondary;

export const fontColorFocus = colors.focus;

export const lightBg = "#DFE8E7"

export const lightFont = "#A6BFBC"

export const lightFocus = "#C2888E"

export const darkBg = "#0B0D1F"

export const darkFont = "#1F2455"

export const darkFocus = "#C2888E"

export const darkBack1 = "#0b0d1f98"

export const darkBack2 = "#1f24558c"

export const lightBack1 = "#dfe8e7b4"

export const lightBack2 = "#a6bfbc9f"

export const lightLight1 = "#FFFD82"

export const lightLight2 = "#3185FC"

const viseme_map_str = `1 open -0.05 upper_down 0.9 lower_up 1
2 open 0.01 wide 0.7 lower_down 0.5
3 upper_up 1 lower_up 1
4 narrow 1 open 0.1
7 open -0.05 wide 0.7 lower_down 0.75
8 wide 4
9 narrow 0.8 open -0.05 upper_up 0.3 lower_down 0.6 frown 0.2
10 open 0.25 frown 0.75
11 open 0.4 wide 0.75 lower_down 0.7
12 open 0.5 narrow 0.75
14 open 0.85 wide 0.35`
var viseme_map = {}
var moves_map = {}
for(var line of viseme_map_str.split('\n')){
    var line_list = line.split(' ')
    var moves_list = line_list.slice(1)
    moves_map = {}
    for(var i=0; i<moves_list.length; i+=2){
        moves_map[moves_list[i]] = moves_list[i+1]
    }
  viseme_map[line_list[0]] = moves_map
}

viseme_map["0"] = {}

export const visemeMap = viseme_map