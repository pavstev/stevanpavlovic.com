package svg

// CommandType defines the SVG path instruction
type CommandType rune

const (
	MoveTo            CommandType = 'M'
	LineTo            CommandType = 'L'
	CurveTo           CommandType = 'C' // Cubic Bézier
	QuadraticCurveTo  CommandType = 'Q' // Quadratic Bézier
	ClosePath         CommandType = 'Z'
)

// Point represents a 2D coordinate vector [x, y]
type Point struct {
	X, Y float64
}

// Command represents a single path instruction and its absolute coordinates
type Command struct {
	Type   CommandType
	Points []Point // Coordinates relevant to the command
}

// Path represents a collection of commands forming a shape
type Path struct {
	Commands []Command
}
