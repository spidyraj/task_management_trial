package com.taskmanager.service;

import com.taskmanager.dto.PaginatedTasksResponse;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskStatsResponse;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedTasksResponse getTasks(
            Integer userId, Boolean completed, String search, String category,
            String priority, Integer page, Integer limit, String sortBy, String sortOrder) {

        int pageNum = (page != null) ? page : 1;
        int size = (limit != null) ? limit : 10;
        
        // Sorting property mapping
        String sortProperty = "createdAt"; // default
        if ("deadline".equalsIgnoreCase(sortBy)) {
            sortProperty = "deadline";
        } else if ("priority".equalsIgnoreCase(sortBy)) {
            sortProperty = "priority";
        }

        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNum - 1, size, Sort.by(direction, sortProperty));

        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User filter
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            // Completed filter
            if (completed != null) {
                predicates.add(cb.equal(root.get("completed"), completed));
            }

            // Category filter
            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            // Priority filter
            if (priority != null && !priority.isBlank()) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            // Search filter
            if (search != null && !search.isBlank()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), likePattern);
                Predicate descriptionLike = cb.like(cb.lower(root.get("description")), likePattern);
                predicates.add(cb.or(titleLike, descriptionLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Task> taskPage = taskRepository.findAll(spec, pageable);
        
        long totalTasks = taskPage.getTotalElements();
        int totalPages = taskPage.getTotalPages();
        boolean hasNext = pageNum < totalPages;
        boolean hasPrev = pageNum > 1;

        PaginatedTasksResponse.PaginationDetails paginationDetails = new PaginatedTasksResponse.PaginationDetails(
                pageNum, size, totalTasks, totalPages, hasNext, hasPrev
        );

        return new PaginatedTasksResponse(taskPage.getContent(), paginationDetails);
    }

    @Transactional
    public Task createTask(Integer userId, TaskRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
            throw new IllegalArgumentException("Title must be 1-200 characters");
        }

        LocalDateTime deadline = parseDeadline(request.getDeadline());
        if (deadline != null && deadline.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Deadline must be in the future");
        }

        Task task = new Task();
        task.setUser(user);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            task.setCategory(request.getCategory());
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            task.setPriority(request.getPriority());
        }
        task.setDeadline(deadline);
        task.setCompleted(request.getCompleted() != null && request.getCompleted());

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateTask(Integer taskId, Integer userId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Task not found");
        }

        if (request.getTitle() != null) {
            if (request.getTitle().trim().isBlank()) {
                throw new IllegalArgumentException("Title must be 1-200 characters");
            }
            task.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        if (request.getCategory() != null) {
            task.setCategory(request.getCategory());
        }

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getCompleted() != null) {
            task.setCompleted(request.getCompleted());
        }

        if (request.getDeadline() != null) {
            LocalDateTime deadline = parseDeadline(request.getDeadline());
            if (deadline != null && deadline.isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Deadline must be in the future");
            }
            task.setDeadline(deadline);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void deleteTask(Integer taskId, Integer userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Task not found");
        }

        taskRepository.delete(task);
    }

    @Transactional
    public Task toggleTask(Integer taskId, Integer userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Task not found");
        }

        task.setCompleted(!task.isCompleted());
        return taskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getTaskStats(Integer userId) {
        long total = taskRepository.countByUserId(userId);
        long completed = taskRepository.countCompletedByUserId(userId);
        long pending = taskRepository.countPendingByUserId(userId);
        long overdue = taskRepository.countOverdueByUserId(userId, LocalDateTime.now());

        long completionRate = total > 0 ? Math.round(((double) completed / total) * 100) : 0;

        return new TaskStatsResponse(total, completed, pending, overdue, completionRate);
    }

    private LocalDateTime parseDeadline(String deadlineStr) {
        if (deadlineStr == null || deadlineStr.trim().isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(deadlineStr).toLocalDateTime();
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(deadlineStr);
            } catch (Exception ex) {
                try {
                    return LocalDate.parse(deadlineStr).atStartOfDay();
                } catch (Exception ex2) {
                    throw new IllegalArgumentException("Deadline must be a valid date");
                }
            }
        }
    }
}
