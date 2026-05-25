package com.taskmanager.controller;

import com.taskmanager.dto.ApiResponse;
import com.taskmanager.dto.PaginatedTasksResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskStatsResponse;
import com.taskmanager.model.Task;
import com.taskmanager.security.UserPrincipal;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedTasksResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {

        PaginatedTasksResponse response = taskService.getTasks(
                principal.getUserId(), completed, search, category, priority, page, limit, sortBy, sortOrder
        );
        return ResponseEntity.ok(new ApiResponse<>(true, response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskRequest request) {

        Task task = taskService.createTask(principal.getUserId(), request);
        ApiResponse<Task> apiResponse = new ApiResponse<>(true, "Task created successfully", task);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TaskRequest request) {

        Task task = taskService.updateTask(id, principal.getUserId(), request);
        ApiResponse<Task> apiResponse = new ApiResponse<>(true, "Task updated successfully", task);
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal) {

        taskService.deleteTask(id, principal.getUserId());
        ApiResponse<Void> apiResponse = new ApiResponse<>(true, "Task deleted successfully");
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Task>> toggleTask(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal) {

        Task task = taskService.toggleTask(id, principal.getUserId());
        ApiResponse<Task> apiResponse = new ApiResponse<>(true, "Task status toggled successfully", task);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TaskStatsResponse>> getTaskStats(
            @AuthenticationPrincipal UserPrincipal principal) {

        TaskStatsResponse stats = taskService.getTaskStats(principal.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, stats));
    }
}
