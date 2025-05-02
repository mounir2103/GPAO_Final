package com.solution.tp_gpao.users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @Query("""
            SELECT u
            FROM User u
            JOIN u.roles r
            WHERE u.enabled = true AND r.id = 2 AND u.userId = :userId
        """)
    Optional<User> findByUserIdAndRoleId(@Param("userId") Long userId);


    @Query("""
        SELECT u
        FROM User u
        JOIN u.roles r
        WHERE r.name = 'USER'
        """)
    Page<User> findAllUsersWithUserRole(Pageable pageable);

    @Query("""
            SELECT u
            FROM User u
            JOIN u.roles r
            WHERE u.enabled = true AND r.id = 1 AND u.userId = :userId
        """)
    Optional<User> findByAdminIdAndRoleId(@Param("userId") Long userId);

    @Query("""
        SELECT u
        FROM User u
        JOIN u.roles r
        WHERE r.name = 'ADMIN'
        """)
    Page<User> findAllUsersWithAdminRole(Pageable pageable);

}
