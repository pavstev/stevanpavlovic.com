package svg

import (
	"fmt"
	"math"
	"strings"
)

// Point represents a 2D coordinate vector [x, y]
type Point struct {
	X, Y float64
}

// DistanceToLine calculates perpendicular distance from P to the line segment (A, B)
func DistanceToLine(p, a, b Point) float64 {
	dx, dy := b.X-a.X, b.Y-a.Y
	if dx == 0 && dy == 0 {
		return math.Hypot(p.X-a.X, p.Y-a.Y)
	}
	num := math.Abs(dy*p.X - dx*p.Y + b.X*a.Y - b.Y*a.X)
	den := math.Sqrt(dx*dx + dy*dy)
	return num / den
}

// SimplifyPoints implements the Ramer-Douglas-Peucker algorithm
func SimplifyPoints(points []Point, eps float64) []Point {
	if len(points) < 3 {
		return points
	}

	maxDist, index := 0.0, 0
	end := len(points) - 1

	for i := 1; i < end; i++ {
		d := DistanceToLine(points[i], points[0], points[end])
		if d > maxDist {
			index, maxDist = i, d
		}
	}

	if maxDist > eps {
		res1 := SimplifyPoints(points[:index+1], eps)
		res2 := SimplifyPoints(points[index:], eps)
		return append(res1[:len(res1)-1], res2...)
	}

	return []Point{points[0], points[end]}
}

// SmartRound truncates floats to avoid coordinate drift
func SmartRound(val float64, precision int) float64 {
	p := math.Pow(10, float64(precision))
	return math.Round(val*p) / p
}

// RegularizePoints fixes micro-jitters in alignment
func RegularizePoints(points []Point, snapAngle float64) []Point {
	if len(points) < 2 { return points }

	result := make([]Point, len(points))
	copy(result, points)

	for i := 1; i < len(result); i++ {
		p1, p2 := result[i-1], result[i]
		angle := math.Atan2(p2.Y-p1.Y, p2.X-p1.X)

		// Snap to Horizontal
		if math.Abs(angle) < snapAngle || math.Abs(math.Abs(angle)-math.Pi) < snapAngle {
			result[i].Y = p1.Y
		} else if math.Abs(math.Abs(angle)-math.Pi/2) < snapAngle {
			// Snap to Vertical
			result[i].X = p1.X
		}
	}
	return result
}

// SerializePoints converts points back into an optimized SVG string
func SerializePoints(points []Point, precision int) string {
	if len(points) == 0 { return "" }

	var sb strings.Builder
	cursor := Point{SmartRound(points[0].X, precision), SmartRound(points[0].Y, precision)}
	sb.WriteString(fmt.Sprintf("M%g %g", cursor.X, cursor.Y))

	for i := 1; i < len(points); i++ {
		target := Point{SmartRound(points[i].X, precision), SmartRound(points[i].Y, precision)}
		dx, dy := target.X-cursor.X, target.Y-cursor.Y

		if dy == 0 {
			sb.WriteString(fmt.Sprintf("H%g", target.X))
		} else if dx == 0 {
			sb.WriteString(fmt.Sprintf("V%g", target.Y))
		} else {
			absStr := fmt.Sprintf("L%g %g", target.X, target.Y)
			relStr := fmt.Sprintf("l%g %g", dx, dy)
			if len(relStr) < len(absStr) {
				sb.WriteString(relStr)
			} else {
				sb.WriteString(absStr)
			}
		}
		cursor = target
	}
	return sb.String()
}
