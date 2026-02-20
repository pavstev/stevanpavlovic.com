package core

import "time"

type EventType string

const (
	EventTaskStart    EventType = "task_start"
	EventTaskLog      EventType = "task_log"
	EventTaskDone     EventType = "task_done"
	EventTaskError    EventType = "task_error"
	EventPipelineDone EventType = "pipeline_done"
)

type Event struct {
	Type   EventType
	TaskID string
	Data   string
	Time   time.Time
}

var EventBus = make(chan Event, 5000)

func PublishEvent(t EventType, taskID string, data string) {
	if TuiMode {
		select {
		case EventBus <- Event{Type: t, TaskID: taskID, Data: data, Time: time.Now()}:
		default:
			// Buffer full, drop to avoid blocking execution
		}
	}
}
