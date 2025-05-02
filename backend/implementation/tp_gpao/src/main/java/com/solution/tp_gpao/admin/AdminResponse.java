package com.solution.tp_gpao.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder @Getter @Setter
public class AdminResponse {

    private Long id;
    private String fullName;
    private String email;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
}
