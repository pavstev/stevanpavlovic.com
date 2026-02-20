package svg

import (
	"testing"
)

func TestParsePath(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected int
	}{
		{"Move and Line", "M 10 10 L 20 20", 2},
		{"Tight spacing", "M10 10L20 20", 2},
		{"Scientific notation", "M1.5e2 200", 1},
		{"Multiple points", "M10 10 20 20 30 30", 1}, // M with implicit L
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cmds := ParsePath(tt.input)
			if len(cmds) != tt.expected {
				t.Errorf("expected %d commands, got %d", tt.expected, len(cmds))
			}
		})
	}
}

func TestDistanceToLine(t *testing.T) {
	p := Point{0, 5}
	a := Point{0, 0}
	b := Point{10, 0}
	dist := DistanceToLine(p, a, b)
	if dist != 5 {
		t.Errorf("expected distance 5, got %f", dist)
	}

	p2 := Point{5, 5}
	dist2 := DistanceToLine(p2, a, b)
	if dist2 != 5 {
		t.Errorf("expected distance 5, got %f", dist2)
	}
}

func TestSimplifyPath(t *testing.T) {
	points := []Point{
		{0, 0},
		{5, 0.1}, // Close to line
		{10, 0},
	}
	simplified := SimplifyPath(points, 0.5)
	if len(simplified) != 2 {
		t.Errorf("expected 2 points, got %d", len(simplified))
	}

	points2 := []Point{
		{0, 0},
		{5, 5}, // Far from line
		{10, 0},
	}
	simplified2 := SimplifyPath(points2, 0.5)
	if len(simplified2) != 3 {
		t.Errorf("expected 3 points, got %d", len(simplified2))
	}
}

func TestSnapPointsToAxes(t *testing.T) {
	points := []Point{
		{0, 0},
		{10, 0.01}, // Should snap to horizontal
	}
	snapped := SnapPointsToAxes(points, 0.1)
	if snapped[1].Y != 0 {
		t.Errorf("expected Y to snap to 0, got %f", snapped[1].Y)
	}
}

func TestFormatPathData(t *testing.T) {
	points := []Point{
		{0, 0},
		{10, 0},
		{10, 10},
	}
	formatted := FormatPathData(points, 2)
	// Should use H and V shorthands
	if !contains(formatted, "H10") || !contains(formatted, "V10") {
		t.Errorf("expected H and V shorthands, got %q", formatted)
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || (len(s) > len(substr) && (s[:len(substr)] == substr || contains(s[1:], substr))))
}
