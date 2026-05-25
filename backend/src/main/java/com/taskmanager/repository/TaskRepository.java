package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer>, JpaSpecificationExecutor<Task> {
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.completed = true")
    long countCompletedByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.completed = false")
    long countPendingByUserId(@Param("userId") Integer userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.completed = false AND t.deadline < :now")
    long countOverdueByUserId(@Param("userId") Integer userId, @Param("now") LocalDateTime now);
}
