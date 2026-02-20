package core

import "testing"

func TestCleanANSI(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "No ANSI",
			input:    "hello world",
			expected: "hello world",
		},
		{
			name:     "Simple color",
			input:    "\x1b[31mred text\x1b[0m",
			expected: "red text",
		},
		{
			name:     "Complex formatting",
			input:    "\x1b[1;31;44mbold red on blue\x1b[0m",
			expected: "bold red on blue",
		},
		{
			name:     "Mixed text",
			input:    "plain \x1b[32mgreen\x1b[0m plain",
			expected: "plain green plain",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := CleanANSI(tt.input)
			if actual != tt.expected {
				t.Errorf("CleanANSI(%q) = %q, expected %q", tt.input, actual, tt.expected)
			}
		})
	}
}
