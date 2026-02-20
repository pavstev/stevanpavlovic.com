package svg

import (
	"regexp"
	"strconv"
)

// CommandType defines the SVG path instruction.
type CommandType rune

// Command represents a single path instruction and its points.
type Command struct {
	Type   CommandType
	Points []Point
}

// Robust regex for tokenizing SVG paths (handles scientific notation and tight spacing).
var cmdRegex = regexp.MustCompile(`([a-df-z])|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)`)

// ParsePath tokenizes a 'd' attribute into a slice of Commands.
func ParsePath(d string) []Command {
	tokens := cmdRegex.FindAllStringSubmatch(d, -1)
	var commands []Command
	var currentCmd *Command

	for _, t := range tokens {
		if t[1] != "" { // Found Command Character
			if currentCmd != nil {
				commands = append(commands, *currentCmd)
			}
			currentCmd = &Command{Type: CommandType(t[1][0]), Points: []Point{}}
		} else if t[2] != "" { // Found Numeric Token
			num, _ := strconv.ParseFloat(t[2], 64)
			if currentCmd == nil {
				continue
			}

			// Group coordinates into Points
			// Note: High-level logic here assumes line/move commands.
			// Advanced curve sampling would expand here.
			if len(currentCmd.Points) == 0 || IsPointFull(currentCmd.Type, currentCmd.Points) {
				currentCmd.Points = append(currentCmd.Points, Point{X: num})
			} else {
				currentCmd.Points[len(currentCmd.Points)-1].Y = num
			}
		}
	}
	if currentCmd != nil {
		commands = append(commands, *currentCmd)
	}
	return commands
}

// IsPointFull determines if we need a new coordinate pair based on command type.
func IsPointFull(t CommandType, pts []Point) bool {
	r := rune(t)
	// H, V, h, v only take single values, not coordinate pairs
	if r == 'H' || r == 'V' || r == 'h' || r == 'v' {
		return true
	}
	// Curves (C, S, Q, T) take multiple points; this logic is simplified for RDP line-decimation
	return false
}

// ToAbsolutePoints flattens a command list into a sequence of absolute world-space points.
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
