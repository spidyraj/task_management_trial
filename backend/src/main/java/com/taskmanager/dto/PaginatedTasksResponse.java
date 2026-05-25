package com.taskmanager.dto;

import com.taskmanager.model.Task;

import java.util.List;

public class PaginatedTasksResponse {
    private List<Task> tasks;
    private PaginationDetails pagination;

    public PaginatedTasksResponse(List<Task> tasks, PaginationDetails pagination) {
        this.tasks = tasks;
        this.pagination = pagination;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public PaginationDetails getPagination() {
        return pagination;
    }

    public void setPagination(PaginationDetails pagination) {
        this.pagination = pagination;
    }

    public static class PaginationDetails {
        private int page;
        private int limit;
        private long total;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrev;

        public PaginationDetails(int page, int limit, long total, int totalPages, boolean hasNext, boolean hasPrev) {
            this.page = page;
            this.limit = limit;
            this.total = total;
            this.totalPages = totalPages;
            this.hasNext = hasNext;
            this.hasPrev = hasPrev;
        }

        public int getPage() {
            return page;
        }

        public void setPage(int page) {
            this.page = page;
        }

        public int getLimit() {
            return limit;
        }

        public void setLimit(int limit) {
            this.limit = limit;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public int getTotalPages() {
            return totalPages;
        }

        public void setTotalPages(int totalPages) {
            this.totalPages = totalPages;
        }

        public boolean isHasNext() {
            return hasNext;
        }

        public void setHasNext(boolean hasNext) {
            this.hasNext = hasNext;
        }

        public boolean isHasPrev() {
            return hasPrev;
        }

        public void setHasPrev(boolean hasPrev) {
            this.hasPrev = hasPrev;
        }
    }
}
