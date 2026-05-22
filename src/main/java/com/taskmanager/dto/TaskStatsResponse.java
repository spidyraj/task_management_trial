package com.taskmanager.dto;

public class TaskStatsResponse {
    private long total;
    private long completed;
    private long pending;
    private long overdue;
    private double completionRate;

    public TaskStatsResponse(long total, long completed, long pending, long overdue, double completionRate) {
        this.total = total;
        this.completed = completed;
        this.pending = pending;
        this.overdue = overdue;
        this.completionRate = completionRate;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getOverdue() {
        return overdue;
    }

    public void setOverdue(long overdue) {
        this.overdue = overdue;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}
