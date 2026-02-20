package svg

import (
	"regexp"
	"strconv"
)

// CommandType defines the SVG path instruction
type CommandType rune

// Command represents a single path instruction and its points
type Command struct {
	Type   CommandType
	Points []Point
}

var cmdRegex = regexp.MustCompile(`([a-df-z])|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)`)

// ParsePath tokenizes a 'd' attribute into a slice of Commands
func ParsePath(d string) []Command {
	tokens := cmdRegex.FindAllStringSubmatch(d, -1)
	var commands []Command
	var currentCmd *Command

	for _, t := range tokens {
		if t[1] != "" { // Command char
			if currentCmd != nil {
				commands = append(commands, *currentCmd)
			}
			currentCmd = &Command{Type: CommandType(t[1][0]), Points: []Point{}}
		} else if t[2] != "" { // Number
			num, _ := strconv.ParseFloat(t[2], 64)
			if currentCmd == nil { continue }

			// Group coordinates into Points (assume pairs for simplicity)
			if len(currentCmd.Points) == 0 || IsPointFull(currentCmd.Type, currentCmd.Points) {
				currentCmd.Points = append(currentCmd.Points, Point{X: num})
			} else {
				currentCmd.Points[len(currentCmd.Points)-1].Y = num
			}
		}
	}
	if currentCmd != nil { commands = append(commands, *currentCmd) }
	return commands
}

// IsPointFull determines if we need a new coordinate pair
func IsPointFull(t CommandType, pts []Point) bool {
	r := rune(t)
	// H, V, h, v only take single values, not pairs
	if r == 'H' || r == 'V' || r == 'h' || r == 'v' {
		return true
	}
	// Default assumption is pairs
	return false
}

// ToAbsolutePoints flattens a command list into a sequence of absolute world-space points
func ToAbsolutePoints(commands []Command) []Point {
	var points []Point
	cursor := Point{0, 0}

	for _, cmd := range commands {
		r := rune(cmd.Type)
		isRel := r >= 'a' && r <= 'z'

		for _, p := range cmd.Points {
			target := p
			if isRel {
				target.X += cursor.X
				target.Y += cursor.Y
			}
			points = append(points, target)
			cursor = target
		}
	}
	return points
}
