package com.solution.tp_gpao.users;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;
import java.lang.Long;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse{

    private Long id;
    private String fullName;
    private String email;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
    private boolean isEnabled;
    private boolean isLocked;
}
