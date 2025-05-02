package com.solution.tp_gpao.users;

import com.solution.tp_gpao.admin.AdminResponse;
import org.springframework.stereotype.Service;

@Service
public class UserMappers {
    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getUserId())
                .fullName(user.fullName())
                .email(user.getEmail())
                .dateOfBirth(user.getBirthdate())
                .createdAt(user.getCreatedDate())
                .isEnabled(user.isEnabled())
                .isLocked(user.isAccountLocked())
                .build();
    }
    public AdminResponse toAdminResponse(User user) {
        return AdminResponse.builder()
                .id(user.getUserId())
                .fullName(user.fullName())
                .email(user.getEmail())
                .dateOfBirth(user.getBirthdate())
                .createdAt(user.getCreatedDate())
                .build();
    }

}
